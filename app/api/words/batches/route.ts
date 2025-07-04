import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { WORDS_PER_BATCH, BATCHES_PER_LEVEL } from "@/lib/level-config";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        proficiencyLevel: true,
        learningLanguage: true,
        currentBatch: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get batch information for current level
    const batchStats = await prisma.word.groupBy({
      by: ['batchNumber'],
      where: {
        userId: user.id,
        proficiencyLevel: user.proficiencyLevel,
        learningLanguage: user.learningLanguage,
      },
      _count: true,
      orderBy: {
        batchNumber: 'asc',
      },
    });

    // Get learned word counts for each batch separately
    const learnedCountsByBatch = await Promise.all(
      batchStats.map(async (batch) => {
        const learnedCount = await prisma.word.count({
          where: {
            userId: user.id,
            proficiencyLevel: user.proficiencyLevel,
            learningLanguage: user.learningLanguage,
            batchNumber: batch.batchNumber,
            learned: true,
          },
        });
        return { batchNumber: batch.batchNumber, learnedCount };
      })
    );

    // Transform the batch stats into a more usable format
    const batches = batchStats.map(batch => {
      const totalWords = batch._count || 0;
      const learnedData = learnedCountsByBatch.find(l => l.batchNumber === batch.batchNumber);
      const learnedWords = learnedData?.learnedCount || 0;
      const progress = totalWords > 0 ? (learnedWords / totalWords) * 100 : 0;
      const isCompleted = learnedWords >= WORDS_PER_BATCH;
      const isAvailable = batch.batchNumber <= user.currentBatch;

      return {
        batchNumber: batch.batchNumber,
        totalWords,
        learnedWords,
        progress: Math.round(progress),
        isCompleted,
        isAvailable,
        isCurrent: batch.batchNumber === user.currentBatch,
      };
    });

    // Add empty batches up to the maximum number of batches per level
    const maxBatch = Math.max(user.currentBatch, ...batchStats.map(b => b.batchNumber));
    for (let i = 1; i <= Math.min(maxBatch + 1, BATCHES_PER_LEVEL); i++) {
      if (!batches.find(b => b.batchNumber === i)) {
        batches.push({
          batchNumber: i,
          totalWords: 0,
          learnedWords: 0,
          progress: 0,
          isCompleted: false,
          isAvailable: i <= user.currentBatch,
          isCurrent: i === user.currentBatch,
        });
      }
    }

    // Sort batches by batch number
    batches.sort((a, b) => a.batchNumber - b.batchNumber);

    return NextResponse.json({
      batches,
      currentBatch: user.currentBatch,
      proficiencyLevel: user.proficiencyLevel,
      totalBatchesPerLevel: BATCHES_PER_LEVEL,
    });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching batches" },
      { status: 500 }
    );
  }
}