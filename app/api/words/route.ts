// File: app/api/words/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Word } from "@/types/word";

const requestSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(50).optional().default(50),
  level: z.string().optional(),
});

const wordsPerLevel = {
  A1: 1000,
  A2: 1000,
  B1: 1000,
  B2: 1000,
  C1: 1000,
};

const getPagesForLevel = (level: string): number => {
  const totalWords = wordsPerLevel[level as keyof typeof wordsPerLevel] || 1000;
  return totalWords / 50; // 50 words per page
};

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { page, pageSize, level } = requestSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        proficiencyLevel: true,
        words: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentLevel = level || user.proficiencyLevel;
    const wordsForLevel = user.words.filter(
      (word: Word) => word.proficiencyLevel === currentLevel
    );

    const totalWordsForLevel =
      wordsPerLevel[currentLevel as keyof typeof wordsPerLevel] || 1000;
    const totalPages = getPagesForLevel(currentLevel);

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const words = wordsForLevel.slice(start, end);

    const learnedWords = words.filter((word: Word) => word.learned).length;
    const progress = `${learnedWords}/${words.length}`;
    const currentBatch = `${Math.min(
      wordsForLevel.length,
      page * pageSize
    )}/${totalWordsForLevel}`;

    return NextResponse.json({
      words,
      totalPages,
      currentPage: page,
      progress,
      currentBatch,
      proficiencyLevel: currentLevel,
    });
  } catch (error) {
    console.error("Error in words API:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
