// File: scripts/generateWords.ts

import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Word } from "@/types/word";

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
  proficiencyLevel: string
): Promise<GeneratedWord[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `Generate exactly 1000 ${language} words appropriate for ${proficiencyLevel} level learners with their English translations. 

  For level requirements:
  ${
    proficiencyLevel === "A1"
      ? `
  A1 (Beginner) words should be:
  - Basic everyday vocabulary
  - Common nouns, verbs, and adjectives
  - Simple time expressions
  - Basic numbers and colors
  - Common greetings and phrases
  `
      : `
  A2 (Elementary) words should be:
  - Expanded everyday vocabulary
  - More varied verbs and tenses
  - Common expressions and idioms
  - Words for opinions and feelings
  - Basic professional vocabulary
  `
  }

  Please ensure:
  - Exactly 1000 unique words
  - No duplicates
  - Appropriate difficulty for the level
  - Mix of nouns, verbs, adjectives, and common phrases
  - Focus on practical, commonly used words
  - Words are in their basic/dictionary form

  Respond only with a JSON array in this format:
  [
    {
      "original": "word in ${language}",
      "translation": "English translation"
    },
    ...
  ]`;

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
    if (words.length !== 1000) {
      throw new Error(`Generated ${words.length} words instead of 1000`);
    }

    // Validate word uniqueness
    const uniqueWords = new Set(words.map((w: GeneratedWord) => w.original));
    if (uniqueWords.size !== 1000) {
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
  userId: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { words: true },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const existingWords = user.words || [];

  // Filter out duplicates and prepare new words
  const newWords = words
    .filter(
      (word) =>
        !existingWords.some(
          (existingWord: Word) =>
            existingWord.original === word.original &&
            existingWord.proficiencyLevel === proficiencyLevel
        )
    )
    .map((word) => ({
      original: word.original,
      translation: word.translation,
      learned: false,
      proficiencyLevel: proficiencyLevel,
    }));

  // Update user with new words
  await prisma.user.update({
    where: { id: userId },
    data: {
      words: {
        push: newWords,
      },
    },
  });

  console.log(
    `Added ${newWords.length} new words for ${language} - ${proficiencyLevel}`
  );
}

async function main() {
  console.log("Starting word generation process...");
  const userId = await getOrCreateUser();

  for (const language of languages) {
    console.log(`Processing language: ${language}`);

    for (const level of proficiencyLevels) {
      console.log(`Generating ${level} words for ${language}...`);

      try {
        const words = await generateWords(language, level);
        console.log(`Successfully generated ${words.length} words`);

        await saveWords(words, language, level, userId);
        console.log(`Saved ${level} words for ${language}`);

        // Add a small delay between generations to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to process ${language} - ${level}:`, error);
        // Continue with next iteration despite errors
        continue;
      }
    }
  }

  console.log("Word generation process completed");
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
