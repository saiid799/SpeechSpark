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
    const { userId } = auth();
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
        words: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingWords = user.words.filter(
      (word: Word) => word.proficiencyLevel === user.proficiencyLevel
    );

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

    // Only save exactly TARGET_WORD_COUNT words
    const wordsToSave = newWords.slice(0, TARGET_WORD_COUNT);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        words: {
          push: wordsToSave,
        },
      },
    });

    return NextResponse.json({
      message: "Words generated successfully",
      generatedCount: wordsToSave.length,
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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const existingWordsString = existingWords.map((w) => w.original).join(", ");
  const prompt = `Generate ${count} unique ${learningLanguage} words or phrases at ${proficiencyLevel} level with their translations in ${nativeLanguage}. 
  Include a mix of nouns, verbs, adjectives, adverbs, and common expressions.
  IMPORTANT: Do NOT include any of these existing words: ${existingWordsString}
  Focus on modern, practical, and commonly used words or phrases.
  Respond only with a JSON array in this format: 
  [
    {
      "original": "word1",
      "translation": "translation1"
    },
    ...
  ]`;

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
