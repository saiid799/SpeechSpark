import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

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
        targetWordCount: true,
        words: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingWords = user.words;
    const existingWordsCount = existingWords.filter(
      (word: Word) => word.proficiencyLevel === user.proficiencyLevel
    ).length;

    if (existingWordsCount >= user.targetWordCount) {
      return NextResponse.json({
        message: "All words for this level have been generated",
      });
    }

    const wordsToGenerate = Math.min(
      100,
      user.targetWordCount - existingWordsCount
    );

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate ${wordsToGenerate} unique ${user.learningLanguage} words at ${user.proficiencyLevel} level with their translations in ${user.nativeLanguage}. 
    Respond only with a JSON array in this format: 
    [
      {
        "original": "word1",
        "translation": "translation1"
      },
      ...
    ]`;

    const result = await model.generateContent(prompt);
    const generatedContent = await result.response.text();
    const generatedWords: GeneratedWord[] = JSON.parse(generatedContent);

    const newWords = generatedWords
      .filter(
        (newWord) =>
          !existingWords.some(
            (existingWord: Word) =>
              existingWord.original === newWord.original &&
              existingWord.proficiencyLevel === user.proficiencyLevel
          )
      )
      .map((word: GeneratedWord) => ({
        original: word.original,
        translation: word.translation,
        learned: false,
        proficiencyLevel: user.proficiencyLevel,
      }));

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        words: {
          set: [...existingWords, ...newWords],
        },
      },
    });

    const totalWordsCount = updatedUser.words.filter(
      (word: Word) => word.proficiencyLevel === user.proficiencyLevel
    ).length;
    const progress = `${totalWordsCount}/${user.targetWordCount}`;

    return NextResponse.json({
      message: "Words generated successfully",
      newWordsCount: newWords.length,
      progress,
    });
  } catch (error) {
    console.error("Error generating words:", error);
    return NextResponse.json(
      { error: "An error occurred while generating words" },
      { status: 500 }
    );
  }
}
