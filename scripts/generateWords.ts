// File: scripts/generateWords.ts

import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Word } from "@/types/word";
import { WORDS_PER_BATCH, BATCHES_PER_LEVEL } from "@/lib/level-config";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese (Mandarin)",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Bengali",
  "Turkish",
  "Dutch",
  "Swedish",
];

// Only generate for A1 and A2 initially
const proficiencyLevels = ["A1", "A2"];

interface GeneratedWord {
  original: string;
  translation: string;
}

async function generateWords(
  language: string,
  proficiencyLevel: string,
  batchNumber: number,
  wordsCount: number = WORDS_PER_BATCH
): Promise<GeneratedWord[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `You are an expert language curriculum designer with deep knowledge of ${language} pedagogy and the Common European Framework of Reference (CEFR) standards. Generate exactly ${wordsCount} high-quality ${language} words that are perfectly calibrated for ${proficiencyLevel} level learners.

This is batch ${batchNumber} of ${BATCHES_PER_LEVEL} for ${proficiencyLevel} level. Ensure words are appropriate for this progression stage.

Target Language: ${language}
Proficiency Level: ${proficiencyLevel}
Translation Language: English

Level-specific requirements:
${
    proficiencyLevel === "A1"
      ? `
A1 (Beginner) Vocabulary Focus:
- Essential survival vocabulary for basic communication
- High-frequency nouns (family, home, food, clothing, time)
- Core verbs in present tense (be, have, go, come, want, need)
- Basic adjectives for description (big, small, good, bad, hot, cold)
- Numbers 1-100, days, months, colors
- Common greetings, polite expressions, and basic phrases
- Simple prepositions and connecting words
- Personal pronouns and basic question words
`
      : `
A2 (Elementary) Vocabulary Expansion:
- Extended everyday vocabulary for common situations
- Verbs in multiple tenses (past, future, modal verbs)
- Descriptive adjectives and comparative forms
- Expressions for opinions, preferences, and feelings
- Basic work and study vocabulary
- Travel and transportation terms
- Health and body vocabulary
- Simple phrasal verbs and common idioms
- Connecting words for expressing relationships between ideas
`
  }

Quality assurance criteria:
- Prioritize high-frequency words that appear in everyday communication
- Include words that enable learners to express basic needs and ideas
- Balance across word categories (40% nouns, 30% verbs, 20% adjectives, 10% other)
- Ensure words are in their standard dictionary form
- Focus on words that build toward the next proficiency level
- Include culturally relevant vocabulary for ${language}-speaking regions
- Exclude archaic, highly technical, or overly specialized terms

Cultural and linguistic considerations:
- Include words that reflect contemporary usage in ${language}
- Consider regional variations and choose the most widely understood forms
- Include words that help learners navigate cultural contexts
- Ensure appropriate register and formality levels

Output requirements:
- Generate exactly ${wordsCount} unique, non-duplicate words
- Provide accurate, contextually appropriate English translations
- Use standard orthography and spelling conventions
- Return ONLY a valid JSON array with no additional text

Format:
[
  {
    "original": "word_in_${language}",
    "translation": "precise_english_translation"
  }
]

Generate exactly ${wordsCount} pedagogically sound vocabulary items for ${proficiencyLevel} ${language} learners.`;

  try {
    const result = await model.generateContent(prompt);
    const generatedContent = await result.response.text();

    // Extract JSON from response
    const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const words = JSON.parse(jsonMatch[0]);

    // Validate word count
    if (words.length !== wordsCount) {
      throw new Error(`Generated ${words.length} words instead of ${wordsCount}`);
    }

    // Validate word uniqueness
    const uniqueWords = new Set(words.map((w: GeneratedWord) => w.original));
    if (uniqueWords.size !== wordsCount) {
      throw new Error("Duplicate words found in generated content");
    }

    return words;
  } catch (error) {
    console.error(
      `Error generating words for ${language} - ${proficiencyLevel}:`,
      error
    );
    throw error;
  }
}

async function getOrCreateUser(): Promise<string> {
  let user = await prisma.user.findFirst();

  if (!user) {
    const randomClerkId = `generated-clerk-id-${Math.random()
      .toString(36)
      .slice(2)}`;
    const randomEmail = `generated-${Math.random()
      .toString(36)
      .slice(2)}@example.com`;

    user = await prisma.user.create({
      data: {
        clerkId: randomClerkId,
        email: randomEmail,
        nativeLanguage: "English", // Default values
        learningLanguage: "Spanish",
        proficiencyLevel: "A1",
        targetWordCount: 1000,
      },
    });
    console.log("Created new user for word generation:", user.id);
  }

  return user.id;
}

async function saveWords(
  words: GeneratedWord[],
  language: string,
  proficiencyLevel: string,
  batchNumber: number,
  userId: string
) {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      id: true,
      learningLanguage: true,
      nativeLanguage: true 
    },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  // Get existing words for this user and level to avoid duplicates
  const existingWords = await prisma.word.findMany({
    where: {
      userId: userId,
      proficiencyLevel: proficiencyLevel,
      learningLanguage: language,
    },
    select: { original: true },
  });

  const existingWordSet = new Set(existingWords.map(w => w.original));

  // Filter out duplicates and prepare new words
  const newWords = words
    .filter(word => !existingWordSet.has(word.original))
    .map((word) => ({
      original: word.original,
      translation: word.translation,
      learned: false,
      proficiencyLevel: proficiencyLevel,
      learningLanguage: language,
      nativeLanguage: "English", // Default to English for now
      batchNumber: batchNumber,
      userId: userId,
    }));

  if (newWords.length === 0) {
    console.log(`No new words to add for ${language} - ${proficiencyLevel} batch ${batchNumber}`);
    return;
  }

  // Save words to database
  const createdWords = await prisma.word.createMany({
    data: newWords,
  });

  console.log(
    `Added ${createdWords.count} new words for ${language} - ${proficiencyLevel} batch ${batchNumber}`
  );
}

async function main() {
  console.log("Starting batch-based word generation process...");
  const userId = await getOrCreateUser();

  for (const language of languages) {
    console.log(`Processing language: ${language}`);

    for (const level of proficiencyLevels) {
      console.log(`Generating ${level} words for ${language} in ${BATCHES_PER_LEVEL} batches...`);

      // Generate words in batches
      for (let batchNumber = 1; batchNumber <= BATCHES_PER_LEVEL; batchNumber++) {
        try {
          console.log(`Generating batch ${batchNumber}/${BATCHES_PER_LEVEL} for ${language} - ${level}...`);
          
          const words = await generateWords(language, level, batchNumber);
          console.log(`Successfully generated ${words.length} words for batch ${batchNumber}`);

          await saveWords(words, language, level, batchNumber, userId);
          console.log(`Saved batch ${batchNumber} for ${language} - ${level}`);

          // Add a small delay between batch generations to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Failed to process ${language} - ${level} batch ${batchNumber}:`, error);
          // Continue with next batch despite errors
          continue;
        }
      }
      
      console.log(`Completed all batches for ${language} - ${level}`);
    }
  }

  console.log("Batch-based word generation process completed");
}

// Error handling for the main process
main()
  .catch((error) => {
    console.error("Fatal error in word generation process:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Database connection closed");
  });
