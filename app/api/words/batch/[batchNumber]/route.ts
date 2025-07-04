import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { WORDS_PER_BATCH } from "@/lib/level-config";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ batchNumber: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const batchNumber = parseInt(resolvedParams.batchNumber);

    if (isNaN(batchNumber) || batchNumber < 1) {
      return NextResponse.json({ error: "Invalid batch number" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        proficiencyLevel: true,
        learningLanguage: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get words for the specific batch
    const batchWords = await prisma.word.findMany({
      where: {
        userId: user.id,
        proficiencyLevel: user.proficiencyLevel,
        learningLanguage: user.learningLanguage,
        batchNumber: batchNumber,
      },
      select: {
        id: true,
        original: true,
        translation: true,
        learned: true,
        proficiencyLevel: true,
        batchNumber: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate batch statistics
    const learnedWordsInBatch = batchWords.filter(word => word.learned).length;
    const totalWordsInBatch = batchWords.length;
    const batchProgress = totalWordsInBatch > 0 ? (learnedWordsInBatch / totalWordsInBatch) * 100 : 0;
    const isCompleted = learnedWordsInBatch >= WORDS_PER_BATCH;

    return NextResponse.json({
      words: batchWords,
      batchNumber,
      batchStats: {
        totalWords: totalWordsInBatch,
        learnedWords: learnedWordsInBatch,
        progress: Math.round(batchProgress),
        isCompleted,
      },
      proficiencyLevel: user.proficiencyLevel,
    });
  } catch (error) {
    console.error("Error fetching batch words:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching batch words" },
      { status: 500 }
    );
  }
}