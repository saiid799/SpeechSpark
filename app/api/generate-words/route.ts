// File: app/api/generate-words/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RateLimiter } from "limiter";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

// Create a rate limiter that allows 1 request per second
const limiter = new RateLimiter({ tokensPerInterval: 1, interval: "second" });

interface GeneratedWord {
  original: string;
  translation: string;
}

interface Word {
  original: string;
  translation: string;
  learned: boolean;
  proficiencyLevel: string;
}

const TARGET_WORD_COUNT = 50;

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get existing words for the current proficiency level
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

    let newWords: Word[] = [];
    let retries = 0;
    const maxRetries = 3;

    while (newWords.length < TARGET_WORD_COUNT && retries < maxRetries) {
      const wordsToGenerate = TARGET_WORD_COUNT - newWords.length;
      try {
        // Wait for the rate limiter
        await limiter.removeTokens(1);

        const generatedWords = await generateWords(
          user.learningLanguage,
          user.nativeLanguage,
          user.proficiencyLevel,
          wordsToGenerate,
          existingWords
        );

        const convertedWords: Word[] = generatedWords.map((word) => ({
          original: word.original,
          translation: word.translation,
          learned: false,
          proficiencyLevel: user.proficiencyLevel,
        }));

        newWords = [...newWords, ...convertedWords].slice(0, TARGET_WORD_COUNT);
      } catch (error) {
        console.error("Error generating words:", error);
        retries++;
        // Wait for 5 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    if (newWords.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate new words after multiple attempts" },
        { status: 500 }
      );
    }

    // Create words in the database
    const wordCreateData = newWords.map(word => ({
      original: word.original,
      translation: word.translation,
      learned: word.learned,
      proficiencyLevel: word.proficiencyLevel,
      learningLanguage: user.learningLanguage,
      nativeLanguage: user.nativeLanguage,
      userId: user.id,
    }));

    // Create words individually to handle duplicates gracefully
    let successfullyCreated = 0;
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
          continue;
        }
        // Log other errors but continue
        console.error(`Error creating word ${wordData.original}:`, error);
      }
    }

    return NextResponse.json({
      message: "Words generated successfully",
      generatedCount: successfullyCreated,
      totalAttempted: newWords.length,
      duplicatesSkipped: newWords.length - successfullyCreated,
    });
  } catch (error) {
    console.error("Error generating words:", error);
    return NextResponse.json(
      { error: "An error occurred while generating words" },
      { status: 500 }
    );
  }
}

async function generateWords(
  learningLanguage: string,
  nativeLanguage: string,
  proficiencyLevel: string,
  count: number,
  existingWords: Word[]
): Promise<GeneratedWord[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const existingWordsString = existingWords.map((w) => w.original).join(", ");
  
  const prompt = `You are an expert multilingual curriculum designer with deep knowledge of global language learning methodologies. Generate ${count} carefully curated ${learningLanguage} vocabulary items that represent modern, practical usage for ${proficiencyLevel} level learners.

🌍 GLOBAL LANGUAGE FRAMEWORK:
Learning Language: ${learningLanguage}
Native Language: ${nativeLanguage}
Target Proficiency: ${proficiencyLevel}
Vocabulary Count: ${count}

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

🚫 EXCLUSION REQUIREMENTS:
Absolutely avoid these existing words: ${existingWordsString}

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
