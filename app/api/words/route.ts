// File: app/api/words/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { wordCache } from "@/lib/word-cache";
import { WORDS_PER_PAGE, WORDS_PER_BATCH } from "@/lib/level-config";

const requestSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(50).optional().default(WORDS_PER_PAGE),
  level: z.string().optional(),
  batch: z.number().int().positive().optional(), // Optional batch number for specific batch queries
});

// Function to check batch completeness without auto-generation to prevent infinite loops
async function checkBatchCompleteness(
  user: { id: string; proficiencyLevel: string; learningLanguage: string },
  batchNumber: number,
  proficiencyLevel: string,
  logValidation: boolean = false
): Promise<{ wordCount: number; isComplete: boolean; wordsNeeded: number }> {
  const batchWordCount = await prisma.word.count({
    where: {
      userId: user.id,
      proficiencyLevel: proficiencyLevel,
      learningLanguage: user.learningLanguage,
      batchNumber: batchNumber,
    },
  });

  // Only log when explicitly requested to reduce log spam
  if (logValidation) {
    console.log(`Batch ${batchNumber} validation: ${batchWordCount}/${WORDS_PER_BATCH} words`);
  }

  return {
    wordCount: batchWordCount,
    isComplete: batchWordCount >= WORDS_PER_BATCH,
    wordsNeeded: Math.max(0, WORDS_PER_BATCH - batchWordCount)
  };
}


export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { page, level, batch } = requestSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        proficiencyLevel: true,
        learningLanguage: true,
        currentBatch: true,
        currentPage: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentLevel = level || user.proficiencyLevel;
    
    // CRITICAL FIX: Use page number as batch number for consistent navigation
    // Each page corresponds to a specific batch, ensuring predictable navigation
    const targetBatch = batch || page;
    
    console.log(`Words API: page=${page}, batch=${batch}, targetBatch=${targetBatch}, level=${currentLevel}`);
    
    // Check batch completeness for logging purposes only
    const batchStatus = await checkBatchCompleteness(user, targetBatch, currentLevel, false);
    
    // Only log significant issues to reduce noise
    if (!batchStatus.isComplete && batchStatus.wordCount < 5) {
      console.log(`Batch ${targetBatch} incomplete: ${batchStatus.wordCount}/${WORDS_PER_BATCH} words (needs ${batchStatus.wordsNeeded} more)`);
    }
    
    // Build query conditions - always filter by batch number for consistency
    const whereConditions = {
      userId: user.id,
      proficiencyLevel: currentLevel,
      learningLanguage: user.learningLanguage,
      batchNumber: targetBatch, // Consistent batch filtering
    };
    
    // Skip batch word count check for performance
    
    // Get total words count for level (for calculating total pages)
    let levelWordsCount = await wordCache.getCachedWordCount(user.id, currentLevel) || 0;
    if (levelWordsCount === 0) {
      levelWordsCount = await prisma.word.count({
        where: {
          userId: user.id,
          proficiencyLevel: currentLevel,
          learningLanguage: user.learningLanguage,
        },
      });
      await wordCache.cacheWordCount(user.id, currentLevel, levelWordsCount);
    }

    // Calculate total pages based on all words in level, organized by batches
    const totalBatches = Math.ceil(levelWordsCount / WORDS_PER_BATCH) || 1;
    const totalPages = totalBatches;

    // Fetch words for the specific batch with consistent ordering
    const words = await prisma.word.findMany({
      where: whereConditions,
      select: {
        id: true,
        original: true,
        translation: true,
        learned: true,
        proficiencyLevel: true,
        batchNumber: true,
        createdAt: true,
      },
      orderBy: [
        { batchNumber: 'asc' },
        { createdAt: 'asc' }
      ],
    });

    console.log(`Found ${words.length} words for batch ${targetBatch}, page ${page}`);

    const learnedWords = words.filter(word => word.learned).length;
    const progress = `${learnedWords}/${words.length}`;
    const currentBatchInfo = `Batch ${targetBatch}: ${words.length}/${WORDS_PER_BATCH}`;

    // Return consistent response structure
    return NextResponse.json({
      words: words.map(word => ({
        id: word.id,
        original: word.original,
        translation: word.translation,
        learned: word.learned,
        proficiencyLevel: word.proficiencyLevel
      })),
      totalPages,
      currentPage: page, // Always return the requested page
      progress,
      currentBatch: currentBatchInfo,
      batchNumber: targetBatch,
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
