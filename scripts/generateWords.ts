// File: scripts/generateWords.ts

import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  "Norwegian",
  "Danish",
  "Finnish",
  "Greek",
  "Polish",
  "Czech",
  "Vietnamese",
  "Thai",
  "Indonesian",
  "Malay",
  "Tagalog",
  "Swahili",
  "Persian",
];

const proficiencyLevels = ["A1", "A2"];

async function generateWords(
  language: string,
  proficiencyLevel: string
): Promise<{ original: string; translation: string }[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const prompt = `Generate 1000 ${language} words at ${proficiencyLevel} level with their English translations. 
  Respond only with a JSON array in this format: 
  [
    {
      "original": "word1",
      "translation": "English translation"
    },
    ...
  ]`;

  const result = await model.generateContent(prompt);
  const generatedContent = await result.response.text();

  const jsonContent = generatedContent.substring(
    generatedContent.indexOf("["),
    generatedContent.lastIndexOf("]") + 1
  );

  return JSON.parse(jsonContent);
}

async function getRandomValueFromUsers(
  field: string
): Promise<string | number> {
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    switch (field) {
      case "nativeLanguage":
      case "learningLanguage":
        return "English";
      case "proficiencyLevel":
        return "A1";
      case "targetWordCount":
        return 1000;
      default:
        return "";
    }
  }

  const randomSkip = Math.floor(Math.random() * userCount);
  const randomUser = await prisma.user.findMany({
    select: { [field]: true },
    take: 1,
    skip: randomSkip,
  });

  if (randomUser.length === 0 || !(field in randomUser[0])) {
    throw new Error(`Field ${field} not found in user`);
  }

  const value = randomUser[0][field as keyof (typeof randomUser)[0]];
  return typeof value === "number" ? value : String(value);
}

async function getOrCreateUser(): Promise<string> {
  let user = await prisma.user.findFirst();

  if (!user) {
    const randomClerkId = `generated-clerk-id-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const randomEmail = `generated-${Math.random()
      .toString(36)
      .substr(2, 9)}@example.com`;

    user = await prisma.user.create({
      data: {
        clerkId: randomClerkId,
        email: randomEmail,
        nativeLanguage: (await getRandomValueFromUsers(
          "nativeLanguage"
        )) as string,
        learningLanguage: (await getRandomValueFromUsers(
          "learningLanguage"
        )) as string,
        proficiencyLevel: (await getRandomValueFromUsers(
          "proficiencyLevel"
        )) as string,
        targetWordCount: (await getRandomValueFromUsers(
          "targetWordCount"
        )) as number,
      },
    });
    console.log("Created a new user for word generation.");
  }

  return user.id;
}

async function saveWords(
  words: { original: string; translation: string }[],
  language: string,
  proficiencyLevel: string,
  userId: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { words: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const existingWords = user.words || [];

  // Process each word
  for (const word of words) {
    const wordExists = existingWords.some(
      (existingWord) =>
        existingWord.original === word.original &&
        existingWord.proficiencyLevel === proficiencyLevel
    );

    if (!wordExists) {
      existingWords.push({
        original: word.original,
        translation: word.translation,
        learned: false,
        proficiencyLevel: proficiencyLevel,
      });
    }
  }

  // Update user with new words
  await prisma.user.update({
    where: { id: userId },
    data: { words: existingWords },
  });
}

async function main() {
  const userId = await getOrCreateUser();
  console.log(`Using user ID: ${userId} for word generation.`);

  for (const language of languages) {
    for (const proficiencyLevel of proficiencyLevels) {
      console.log(`Generating words for ${language} - ${proficiencyLevel}`);
      const words = await generateWords(language, proficiencyLevel);
      console.log(`Saving words for ${language} - ${proficiencyLevel}`);
      await saveWords(words, language, proficiencyLevel, userId);
      console.log(`Completed ${language} - ${proficiencyLevel}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
