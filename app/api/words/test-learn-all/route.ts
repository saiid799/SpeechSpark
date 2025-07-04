import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getCurrentBatch } from "@/lib/level-config";
import { invalidateWordCache } from "@/lib/word-cache";

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
        proficiencyLevel: true,
        learningLanguage: true,
      },
    });

    if (!user) {
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

    const currentBatch = getCurrentBatch(learnedWordsInLevel);

    // Get all unlearned words in the current batch
    const unlearnedWords = await prisma.word.findMany({
      where: {
        userId: user.id,
        proficiencyLevel: user.proficiencyLevel,
        learningLanguage: user.learningLanguage,
        batchNumber: currentBatch,
        learned: false,
      },
      select: {
        id: true,
        original: true,
      },
    });

    if (unlearnedWords.length === 0) {
      return NextResponse.json({
        message: "All words in current batch are already learned",
        batchNumber: currentBatch,
        wordsMarked: 0,
      });
    }

    // Mark all unlearned words in current batch as learned
    const updateResult = await prisma.word.updateMany({
      where: {
        userId: user.id,
        proficiencyLevel: user.proficiencyLevel,
        learningLanguage: user.learningLanguage,
        batchNumber: currentBatch,
        learned: false,
      },
      data: {
        learned: true,
      },
    });

    // Invalidate caches after marking words as learned
    if (updateResult.count > 0) {
      try {
        await invalidateWordCache.user(user.id);
        await invalidateWordCache.batch(user.id, user.proficiencyLevel, currentBatch);
        console.log(`Cache invalidated for user ${user.id} after marking ${updateResult.count} words as learned`);
      } catch (cacheError) {
        console.error("Error invalidating cache in test-learn-all:", cacheError);
        // Don't fail the request due to cache errors
      }
    }

    return NextResponse.json({
      message: `Successfully marked ${updateResult.count} words as learned in batch ${currentBatch}`,
      batchNumber: currentBatch,
      wordsMarked: updateResult.count,
      wordsList: unlearnedWords.map(w => w.original),
    });
  } catch (error) {
    console.error("Error in test-learn-all API:", error);
    return NextResponse.json(
      { error: "An error occurred while marking words as learned" },
      { status: 500 }
    );
  }
}