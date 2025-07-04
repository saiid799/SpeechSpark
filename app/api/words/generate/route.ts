import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RateLimiter } from "limiter";
import { filterDuplicateWords, filterDuplicateWordsAdvanced } from "@/lib/word-deduplication";
import { WORDS_PER_BATCH, getCurrentBatch } from "@/lib/level-config";
import { invalidateWordCache } from "@/lib/word-cache";
import { getFallbackWords, hasFallbackWords, getFallbackWordCount } from "@/lib/fallback-words";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// Create a more aggressive rate limiter that allows 5 requests per second with burst capability
const limiter = new RateLimiter({ 
  tokensPerInterval: 10, // Allow burst of 10 requests
  interval: "second",
  fireImmediately: true 
});

interface GeneratedWord {
  original: string;
  translation: string;
}

interface WordData {
  original: string;
  translation: string;
  learned: boolean;
  proficiencyLevel: string;
  learningLanguage: string;
  nativeLanguage: string;
  batchNumber: number;
}

const TARGET_WORD_COUNT = WORDS_PER_BATCH;
const GENERATION_BATCH_SIZE = 75; // Generate more than needed to account for duplicates

// Rate limiting map to prevent concurrent requests from same user
const userGenerationLocks = new Map<string, boolean>();

// API quota tracking
interface QuotaTracker {
  requestCount: number;
  resetTime: number;
  isExhausted: boolean;
}

const quotaTracker: QuotaTracker = {
  requestCount: 0,
  resetTime: Date.now() + 24 * 60 * 60 * 1000, // Reset daily
  isExhausted: false
};

/**
 * Check if API quota is exhausted and update tracking
 */
function checkQuotaStatus(error?: Error): boolean {
  // Reset daily counter
  if (Date.now() > quotaTracker.resetTime) {
    quotaTracker.requestCount = 0;
    quotaTracker.isExhausted = false;
    quotaTracker.resetTime = Date.now() + 24 * 60 * 60 * 1000;
  }

  // Check for quota exhaustion error
  if (error && (
    error.message.includes('429') ||
    error.message.includes('quota') ||
    error.message.includes('Too Many Requests')
  )) {
    quotaTracker.isExhausted = true;
    console.log(`API quota exhausted. Requests made: ${quotaTracker.requestCount}`);
    return true;
  }

  return quotaTracker.isExhausted;
}

/**
 * Increment quota usage
 */
function incrementQuotaUsage() {
  quotaTracker.requestCount++;
}

/**
 * Get remaining quota estimate
 */
function getRemainingQuota(): number {
  const FREE_TIER_LIMIT = 50; // Gemini free tier limit
  return Math.max(0, FREE_TIER_LIMIT - quotaTracker.requestCount);
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if generation is already in progress for this user
    if (userGenerationLocks.get(userId)) {
      return NextResponse.json({ 
        error: "Word generation already in progress for this user" 
      }, { status: 429 });
    }

    // Set lock for this user
    userGenerationLocks.set(userId, true);

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        learningLanguage: true,
        nativeLanguage: true,
        proficiencyLevel: true,
      },
    });

    if (!user) {
      userGenerationLocks.delete(userId); // Release lock
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate the current batch number based on learned words
    const learnedWordsInLevel = await prisma.word.count({
      where: {
        userId: user.id,
        proficiencyLevel: user.proficiencyLevel,
        learningLanguage: user.learningLanguage,
        learned: true,
      },
    });

    const nextBatchNumber = getCurrentBatch(learnedWordsInLevel);

    // Check if this batch already exists
    const existingBatchWords = await prisma.word.findMany({
      where: {
        userId: user.id,
        proficiencyLevel: user.proficiencyLevel,
        learningLanguage: user.learningLanguage,
        batchNumber: nextBatchNumber,
      },
    });

    // If batch already has exactly the target count, don't generate more
    if (existingBatchWords.length === TARGET_WORD_COUNT) {
      userGenerationLocks.delete(userId); // Release lock
      return NextResponse.json({
        message: "Batch already exists with exactly 50 words",
        batchNumber: nextBatchNumber,
        existingWordsCount: existingBatchWords.length,
        generatedCount: 0,
        isComplete: true,
      });
    }

    // Calculate how many more words we need to reach exactly 50
    const wordsNeeded = TARGET_WORD_COUNT - existingBatchWords.length;
    console.log(`Batch ${nextBatchNumber} needs ${wordsNeeded} more words to reach ${TARGET_WORD_COUNT}`);

    // Get all existing words for the current proficiency level to avoid duplicates
    const existingWords = await prisma.word.findMany({
      where: {
        userId: user.id,
        proficiencyLevel: user.proficiencyLevel,
        learningLanguage: user.learningLanguage,
      },
      select: {
        original: true,
        translation: true,
        learned: true,
        proficiencyLevel: true,
      },
    });

    let newWords: WordData[] = [];
    let retries = 0;
    const maxRetries = 3; // Reduced retries to avoid quota exhaustion
    const actualTargetCount = wordsNeeded; // Only generate what we actually need
    let useAI = true;

    // Check quota status before attempting AI generation
    const quotaExhausted = checkQuotaStatus();
    const remainingQuota = getRemainingQuota();
    
    // Check if we should use fallback immediately
    const totalExistingWords = existingWords.length;
    const shouldUseFallback = totalExistingWords > 200 || quotaExhausted || remainingQuota < 2;

    if (shouldUseFallback && hasFallbackWords(user.learningLanguage, user.proficiencyLevel)) {
      console.log(`Using fallback words: existing=${totalExistingWords}, quota=${remainingQuota}, exhausted=${quotaExhausted}`);
      useAI = false;
    }

    while (newWords.length < actualTargetCount && retries < maxRetries) {
      const remainingNeeded = actualTargetCount - newWords.length;
      
      try {
        let generatedWords: GeneratedWord[] = [];

        if (useAI) {
          // Try AI generation first
          const wordsToGenerate = Math.min(
            GENERATION_BATCH_SIZE, 
            Math.max(remainingNeeded * 2, 25) // Reduced multiplier to save API calls
          );

          // Wait for the rate limiter
          await limiter.removeTokens(1);

          generatedWords = await generateWords(
            user.learningLanguage,
            user.nativeLanguage,
            user.proficiencyLevel,
            wordsToGenerate,
            existingWords,
            nextBatchNumber
          );
        } else {
          // Use dynamic fallback words
          const fallbackWords = await getFallbackWords(
            user.learningLanguage,
            user.proficiencyLevel,
            remainingNeeded * 2, // Get more to account for filtering
            [...existingWords, ...newWords],
            user.nativeLanguage
          );
          
          generatedWords = fallbackWords.map(fw => ({
            original: fw.original,
            translation: fw.translation
          }));

          console.log(`Generated ${generatedWords.length} fallback words for ${user.learningLanguage} ${user.proficiencyLevel}`);
        }

        // Apply advanced duplicate filtering - use enhanced version for users with many words
        const filteredWords = totalExistingWords > 150 
          ? filterDuplicateWordsAdvanced(
              generatedWords,
              [...existingWords, ...newWords],
              totalExistingWords
            )
          : filterDuplicateWords(
              generatedWords,
              [...existingWords, ...newWords]
            );

        const convertedWords: WordData[] = filteredWords.map((word) => ({
          original: word.original,
          translation: word.translation,
          learned: false,
          proficiencyLevel: user.proficiencyLevel,
          learningLanguage: user.learningLanguage,
          nativeLanguage: user.nativeLanguage,
          batchNumber: nextBatchNumber,
        }));

        newWords = [...newWords, ...convertedWords].slice(0, actualTargetCount);
        
        // If we got some words, break the retry loop
        if (convertedWords.length > 0) {
          break;
        }
      } catch (error) {
        console.error("Error generating words:", error);
        
        // Update quota tracking and check if exhausted
        const isQuotaExhausted = checkQuotaStatus(error as Error);
        
        if (isQuotaExhausted) {
          console.log(`API quota exhausted (${quotaTracker.requestCount} requests), switching to fallback words`);
          useAI = false;
          
          // Try fallback words if available
          if (hasFallbackWords(user.learningLanguage, user.proficiencyLevel)) {
            const fallbackWords = await getFallbackWords(
              user.learningLanguage,
              user.proficiencyLevel,
              remainingNeeded,
              [...existingWords, ...newWords],
              user.nativeLanguage
            );
            
            const convertedFallback: WordData[] = fallbackWords.map((word) => ({
              original: word.original,
              translation: word.translation,
              learned: false,
              proficiencyLevel: user.proficiencyLevel,
              learningLanguage: user.learningLanguage,
              nativeLanguage: user.nativeLanguage,
              batchNumber: nextBatchNumber,
            }));

            newWords = [...newWords, ...convertedFallback].slice(0, actualTargetCount);
            console.log(`Used ${convertedFallback.length} fallback words due to API quota exhaustion`);
            break;
          }
        }
        
        retries++;
        if (retries < maxRetries) {
          // Exponential backoff
          const waitTime = Math.pow(2, retries) * 1000;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    // CRITICAL FIX: Try fallback words if AI generation completely failed
    if (newWords.length === 0) {
      console.log("AI generation failed completely, attempting fallback word generation...");
      
      try {
        const fallbackWords = await getFallbackWords(
          user.learningLanguage,
          user.proficiencyLevel,
          actualTargetCount,
          existingWords,
          user.nativeLanguage
        );
        
        if (fallbackWords.length > 0) {
          const convertedFallback: WordData[] = fallbackWords.map((word) => ({
            original: word.original,
            translation: word.translation,
            learned: false,
            proficiencyLevel: user.proficiencyLevel,
            learningLanguage: user.learningLanguage,
            nativeLanguage: user.nativeLanguage,
            batchNumber: nextBatchNumber,
          }));

          newWords = convertedFallback.slice(0, actualTargetCount);
          useAI = false; // Mark that we used fallback
          console.log(`Successfully generated ${newWords.length} fallback words as emergency backup`);
        }
      } catch (fallbackError) {
        console.error("Fallback word generation also failed:", fallbackError);
      }
      
      // Only return error if both AI and fallback generation failed
      if (newWords.length === 0) {
        userGenerationLocks.delete(userId); // Release lock
        return NextResponse.json(
          { 
            error: "No new words could be generated at this time. Please try again later.",
            generatedCount: 0,
            quotaStatus: {
              requestsUsed: quotaTracker.requestCount,
              remaining: getRemainingQuota(),
              exhausted: quotaTracker.isExhausted,
              resetTime: quotaTracker.resetTime
            }
          },
          { status: 200 } // Use 200 status to avoid error handling in frontend
        );
      }
    }

    // Only save exactly the words we need
    const wordsToSave = newWords.slice(0, actualTargetCount);
    
    if (wordsToSave.length < actualTargetCount) {
      console.warn(`Only generated ${wordsToSave.length} words but needed ${actualTargetCount}`);
    }

    // Create words in the database with batch operation for better performance
    const wordCreateData = wordsToSave.map(word => ({
      original: word.original,
      translation: word.translation,
      learned: word.learned,
      proficiencyLevel: word.proficiencyLevel,
      learningLanguage: word.learningLanguage,
      nativeLanguage: word.nativeLanguage,
      batchNumber: word.batchNumber,
      userId: user.id,
    }));

    // Create words individually to handle duplicates gracefully
    let successfullyCreated = 0;
    let duplicatesSkipped = 0;
    
    for (const wordData of wordCreateData) {
      try {
        await prisma.word.create({
          data: wordData,
        });
        successfullyCreated++;
      } catch (error) {
        // Skip duplicates silently (unique constraint violation)
        if (error instanceof Error && (
          error.message.includes('duplicate') ||
          error.message.includes('unique') ||
          error.message.includes('E11000')
        )) {
          console.log(`Skipping duplicate word: ${wordData.original}`);
          duplicatesSkipped++;
          continue;
        }
        // Log other errors but continue
        console.error(`Error creating word ${wordData.original}:`, error);
      }
    }

    // If we have duplicates and didn't create enough words, try to generate more
    const totalWordsInBatch = existingBatchWords.length + successfullyCreated;
    if (totalWordsInBatch < TARGET_WORD_COUNT && duplicatesSkipped > 0) {
      console.log(`Attempting to backfill ${TARGET_WORD_COUNT - totalWordsInBatch} words due to duplicates`);
      // Recursive call to generate the remaining words
      try {
        const backfillResponse = await generateBackfillWords(
          user,
          nextBatchNumber,
          TARGET_WORD_COUNT - totalWordsInBatch,
          existingWords
        );
        successfullyCreated += backfillResponse.generatedCount;
      } catch (backfillError) {
        console.error('Backfill generation failed:', backfillError);
      }
    }

    // Return success even if some words were duplicates, as long as we created some
    if (successfullyCreated === 0) {
      userGenerationLocks.delete(userId); // Release lock
      return NextResponse.json(
        { 
          error: "No new words could be created - all generated words may be duplicates",
          duplicatesSkipped: wordsToSave.length 
        },
        { status: 400 }
      );
    }

    // Final verification of batch completeness
    const finalBatchCount = await prisma.word.count({
      where: {
        userId: user.id,
        proficiencyLevel: user.proficiencyLevel,
        learningLanguage: user.learningLanguage,
        batchNumber: nextBatchNumber,
      },
    });

    // Invalidate all user caches after successful word generation
    if (successfullyCreated > 0) {
      try {
        await invalidateWordCache.user(user.id);
        await invalidateWordCache.batch(user.id, user.proficiencyLevel, nextBatchNumber);
        console.log(`Cache invalidated for user ${user.id} after generating ${successfullyCreated} words`);
      } catch (cacheError) {
        console.error("Error invalidating cache:", cacheError);
        // Don't fail the request due to cache errors
      }
    }

    const generationMethod = useAI ? "AI" : "fallback";
    
    return NextResponse.json({
      message: finalBatchCount === TARGET_WORD_COUNT 
        ? `Batch completed with exactly 50 words using ${generationMethod} generation` 
        : `Batch has ${finalBatchCount} words (target: ${TARGET_WORD_COUNT}) using ${generationMethod} generation`,
      batchNumber: nextBatchNumber,
      generatedCount: successfullyCreated,
      totalAttempted: wordsToSave.length,
      duplicatesSkipped: duplicatesSkipped,
      finalBatchSize: finalBatchCount,
      isComplete: finalBatchCount === TARGET_WORD_COUNT,
      generationMethod: generationMethod,
      totalExistingWords: existingWords.length,
      quotaStatus: {
        requestsUsed: quotaTracker.requestCount,
        remaining: getRemainingQuota(),
        exhausted: quotaTracker.isExhausted,
        resetTime: quotaTracker.resetTime
      }
    });
  } catch (error) {
    console.error("Error generating words:", error);
    return NextResponse.json(
      { error: "An error occurred while generating words" },
      { status: 500 }
    );
  } finally {
    // Always release the lock
    const { userId } = await auth();
    if (userId) {
      userGenerationLocks.delete(userId);
    }
  }
}

// Backfill function to generate exactly the needed number of words
async function generateBackfillWords(
  user: { id: string; learningLanguage: string; nativeLanguage: string; proficiencyLevel: string },
  batchNumber: number,
  wordsNeeded: number,
  existingWords: { original: string; translation: string; learned: boolean; proficiencyLevel: string }[]
): Promise<{ generatedCount: number }> {
  console.log(`Backfill: Generating ${wordsNeeded} additional words for batch ${batchNumber}`);
  
  let attempts = 0;
  const maxAttempts = 3;
  let totalGenerated = 0;
  
  while (totalGenerated < wordsNeeded && attempts < maxAttempts) {
    try {
      // Get updated existing words including recently created ones
      const allExistingWords = await prisma.word.findMany({
        where: {
          userId: user.id,
          proficiencyLevel: user.proficiencyLevel,
          learningLanguage: user.learningLanguage,
        },
        select: { original: true, translation: true, learned: true, proficiencyLevel: true },
      });

      const remainingNeeded = wordsNeeded - totalGenerated;
      const generatedWords = await generateWords(
        user.learningLanguage,
        user.nativeLanguage,
        user.proficiencyLevel,
        remainingNeeded * 2, // Generate 2x to account for duplicates
        allExistingWords,
        batchNumber
      );

      // Filter and convert words
      const filteredWords = filterDuplicateWords(generatedWords, allExistingWords);
      const wordsToCreate = filteredWords.slice(0, remainingNeeded).map(word => ({
        original: word.original,
        translation: word.translation,
        learned: false,
        proficiencyLevel: user.proficiencyLevel,
        learningLanguage: user.learningLanguage,
        nativeLanguage: user.nativeLanguage,
        batchNumber: batchNumber,
        userId: user.id,
      }));

      // Create the words
      for (const wordData of wordsToCreate) {
        try {
          await prisma.word.create({ data: wordData });
          totalGenerated++;
          if (totalGenerated >= wordsNeeded) break;
        } catch (error) {
          if (error instanceof Error && (
            error.message.includes('duplicate') ||
            error.message.includes('unique') ||
            error.message.includes('E11000')
          )) {
            console.log(`Backfill: Skipping duplicate word: ${wordData.original}`);
            continue;
          }
          console.error(`Backfill: Error creating word ${wordData.original}:`, error);
        }
      }
      
      attempts++;
      if (totalGenerated < wordsNeeded) {
        console.log(`Backfill attempt ${attempts}: Generated ${totalGenerated}/${wordsNeeded} words`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      }
    } catch (error) {
      console.error(`Backfill attempt ${attempts + 1} failed:`, error);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds on error
    }
  }
  
  console.log(`Backfill completed: ${totalGenerated}/${wordsNeeded} words generated`);
  return { generatedCount: totalGenerated };
}

async function generateWords(
  learningLanguage: string,
  nativeLanguage: string,
  proficiencyLevel: string,
  count: number,
  existingWords: { original: string; translation: string; learned: boolean; proficiencyLevel: string }[],
  batchNumber: number
): Promise<GeneratedWord[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const existingWordsString = existingWords.map((w) => w.original).join(", ");
  
  // Optimize prompt based on how many words user already has
  const isAdvancedUser = existingWords.length > 200;
  const duplicateWarning = isAdvancedUser 
    ? `🚨 CRITICAL DUPLICATE AVOIDANCE: This user has ${existingWords.length} existing words. Generate words that are COMPLETELY DIFFERENT from any existing vocabulary. Focus on specialized, technical, or advanced terminology that is unlikely to overlap with basic vocabulary.`
    : `🚫 EXCLUSION REQUIREMENTS: Absolutely avoid these existing words: ${existingWordsString.slice(0, 500)}${existingWordsString.length > 500 ? '...' : ''}`;

  const prompt = `You are an expert multilingual curriculum designer with deep knowledge of global language learning methodologies. Generate ${count} carefully curated ${learningLanguage} vocabulary items that represent modern, practical usage for ${proficiencyLevel} level learners.

🌍 GLOBAL LANGUAGE FRAMEWORK:
Learning Language: ${learningLanguage}
Native Language: ${nativeLanguage}
Target Proficiency: ${proficiencyLevel}
Vocabulary Count: ${count}
Learning Batch: ${batchNumber} (Progressive difficulty within level)
User Progress: ${existingWords.length} words already learned

${duplicateWarning}

🎯 MODERN VOCABULARY SELECTION:
- Contemporary relevance: Focus on words used in today's digital, interconnected world
- Cross-cultural applicability: Choose vocabulary that works in diverse cultural contexts
- Practical utility: Prioritize high-frequency words that enable real communication
- Progressive scaffolding: Ensure vocabulary builds toward next proficiency level

📱 21st CENTURY CONTEXTS:
Include vocabulary from modern domains:
- Digital communication (social media, messaging, online platforms)
- Global connectivity (travel, international relations, remote work)
- Sustainable living (environment, health, wellness)
- Technology integration (apps, devices, digital services)
- Cultural diversity (inclusive language, global perspectives)

🔤 SCRIPT & WRITING SYSTEM AWARENESS:
- Use authentic ${learningLanguage} orthography and script systems
- For non-Latin scripts: Ensure proper character representation
- Regional considerations: Choose widely understood variants
- Modern spellings: Use current, accepted spelling conventions

🎨 WORD CATEGORY DISTRIBUTION:
- Nouns (35%): Objects, concepts, people, places relevant to modern life
- Verbs (30%): Actions for contemporary situations and digital interactions
- Adjectives (20%): Descriptive words for current experiences and emotions
- Functional words (15%): Prepositions, conjunctions, expressions for fluent communication

⚡ LANGUAGE-SPECIFIC CONSIDERATIONS:
- Tonal languages: Include tone marks where standard
- Gendered languages: Choose base forms appropriate for the language
- Formal/informal registers: Select appropriate formality level for proficiency
- Regional variations: Use internationally recognized forms

🌐 CULTURAL AUTHENTICITY:
- Reflect modern ${learningLanguage}-speaking societies
- Include culturally relevant concepts and expressions
- Avoid outdated or archaic terms unless culturally significant
- Consider global vs. regional usage patterns

🔍 QUALITY ASSURANCE:
- Frequency validation: Choose high-utility vocabulary
- Learning progression: Ensure appropriate difficulty for ${proficiencyLevel}
- Pedagogical value: Select words that unlock further learning
- Real-world application: Focus on vocabulary learners will actually encounter
- UNIQUENESS: Each word must be completely distinct from existing vocabulary

📊 OUTPUT SPECIFICATION:
Return ONLY a valid JSON array with no additional text:
[
  {
    "original": "authentic_${learningLanguage}_word",
    "translation": "precise_${nativeLanguage}_translation"
  }
]

Generate exactly ${count} modern, globally-relevant vocabulary items that empower learners to communicate effectively in today's interconnected world.`;

  try {
    // Track quota usage before making API call
    incrementQuotaUsage();
    
    const result = await model.generateContent(prompt);
    const generatedContent = await result.response.text();

    const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Generated content does not contain valid JSON");
    }

    const jsonContent = jsonMatch[0];
    let parsedWords: GeneratedWord[];

    try {
      parsedWords = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      throw new Error("Failed to parse generated content as JSON");
    }

    if (!Array.isArray(parsedWords) || parsedWords.length === 0) {
      throw new Error("Generated content does not contain valid word data");
    }

    // Filter out any duplicates
    const uniqueWords = parsedWords.filter(
      (word) => !existingWords.some((w) => w.original === word.original)
    );

    return uniqueWords;
  } catch (error) {
    console.error("Error in generateWords function:", error);
    throw error;
  }
}
