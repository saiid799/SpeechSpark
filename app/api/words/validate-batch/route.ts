import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { validateBatchIntegrity } from "@/lib/level-config";

const requestSchema = z.object({
  batchNumber: z.number().int().positive(),
  level: z.string().optional(),
  autoComplete: z.boolean().optional().default(false), // Whether to trigger generation if incomplete
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { batchNumber, level, autoComplete } = requestSchema.parse(body);

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

    const targetLevel = level || user.proficiencyLevel;

    // Check current batch word count
    const batchWords = await prisma.word.findMany({
      where: {
        userId: user.id,
        proficiencyLevel: targetLevel,
        learningLanguage: user.learningLanguage,
        batchNumber: batchNumber,
      },
      select: {
        id: true,
        original: true,
        learned: true,
      },
    });

    const batchValidation = validateBatchIntegrity(batchWords.length);
    const learnedCount = batchWords.filter(word => word.learned).length;

    console.log(`Batch ${batchNumber} validation: ${batchValidation.actualWords}/${batchValidation.expectedWords} words, ${learnedCount} learned`);

    // If batch is incomplete and autoComplete is requested, trigger generation
    let generationTriggered = false;
    if (!batchValidation.isValid && autoComplete && batchValidation.wordsNeeded > 0) {
      try {
        // Call the generation endpoint internally
        const generateResponse = await fetch(`${process.env.NEXTJS_URL || 'http://localhost:3000'}/api/words/generate`, {
          method: 'POST',
          headers: {
            'Authorization': request.headers.get('Authorization') || '',
            'Cookie': request.headers.get('Cookie') || '',
          },
        });

        if (generateResponse.ok) {
          generationTriggered = true;
          console.log(`Generation triggered for batch ${batchNumber}`);
        }
      } catch (generationError) {
        console.error('Failed to trigger auto-generation:', generationError);
      }
    }

    return NextResponse.json({
      batchNumber,
      level: targetLevel,
      validation: {
        isComplete: batchValidation.isValid,
        currentWords: batchValidation.actualWords,
        targetWords: batchValidation.expectedWords,
        wordsNeeded: batchValidation.wordsNeeded,
        completionPercentage: Math.round((batchValidation.actualWords / batchValidation.expectedWords) * 100),
      },
      learning: {
        learnedWords: learnedCount,
        totalWords: batchWords.length,
        learningProgress: batchWords.length > 0 ? Math.round((learnedCount / batchWords.length) * 100) : 0,
      },
      generationTriggered,
      readyForDisplay: batchValidation.isValid,
      recommendation: batchValidation.isValid 
        ? "Batch is complete and ready for learning"
        : batchValidation.wordsNeeded > 40 
          ? "Batch requires significant word generation"
          : "Batch needs minor completion",
    });
  } catch (error) {
    console.error("Error validating batch:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred while validating batch" },
      { status: 500 }
    );
  }
}

// GET endpoint to check multiple batches at once
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const level = url.searchParams.get('level');
    const maxBatches = parseInt(url.searchParams.get('maxBatches') || '5');

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

    const targetLevel = level || user.proficiencyLevel;

    // Get word counts for multiple batches
    const batchStats = await prisma.word.groupBy({
      by: ['batchNumber'],
      where: {
        userId: user.id,
        proficiencyLevel: targetLevel,
        learningLanguage: user.learningLanguage,
        batchNumber: {
          lte: maxBatches,
        },
      },
      _count: true,
      orderBy: {
        batchNumber: 'asc',
      },
    });

    // Validate each batch
    const batchValidations = [];
    for (let batchNum = 1; batchNum <= maxBatches; batchNum++) {
      const batchStat = batchStats.find(stat => stat.batchNumber === batchNum);
      const wordCount = batchStat?._count || 0;
      
      const validation = validateBatchIntegrity(wordCount);
      
      batchValidations.push({
        batchNumber: batchNum,
        validation: {
          isComplete: validation.isValid,
          currentWords: validation.actualWords,
          targetWords: validation.expectedWords,
          wordsNeeded: validation.wordsNeeded,
          completionPercentage: Math.round((validation.actualWords / validation.expectedWords) * 100),
        },
        exists: wordCount > 0,
        readyForDisplay: validation.isValid,
      });
    }

    const incompleteBatches = batchValidations.filter(b => !b.validation.isComplete && b.exists);
    const completeBatches = batchValidations.filter(b => b.validation.isComplete);

    return NextResponse.json({
      level: targetLevel,
      totalBatchesChecked: maxBatches,
      completeBatches: completeBatches.length,
      incompleteBatches: incompleteBatches.length,
      batches: batchValidations,
      summary: {
        allComplete: incompleteBatches.length === 0,
        readyBatches: completeBatches.map(b => b.batchNumber),
        needsAttention: incompleteBatches.map(b => ({
          batchNumber: b.batchNumber,
          wordsNeeded: b.validation.wordsNeeded,
        })),
      },
    });
  } catch (error) {
    console.error("Error in batch validation:", error);
    return NextResponse.json(
      { error: "An error occurred while validating batches" },
      { status: 500 }
    );
  }
}