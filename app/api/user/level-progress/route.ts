import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getNextLevel, canProgressToLevel, WORDS_PER_LEVEL, PROFICIENCY_LEVELS, ProficiencyLevel } from "@/lib/level-config";

export async function POST(_request: Request) {
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

    const currentLevel = user.proficiencyLevel as ProficiencyLevel;
    const nextLevel = getNextLevel(currentLevel);

    if (!nextLevel) {
      return NextResponse.json(
        { error: "Already at the highest level" },
        { status: 400 }
      );
    }

    // Count learned words in current level
    const learnedWordsInLevel = await prisma.word.count({
      where: {
        userId: user.id,
        proficiencyLevel: currentLevel,
        learned: true,
        learningLanguage: user.learningLanguage,
      },
    });

    // Check if user can progress
    if (!canProgressToLevel(currentLevel, learnedWordsInLevel)) {
      return NextResponse.json(
        {
          error: "Insufficient progress",
          required: WORDS_PER_LEVEL,
          current: learnedWordsInLevel,
          remaining: WORDS_PER_LEVEL - learnedWordsInLevel,
        },
        { status: 400 }
      );
    }

    // Update user's proficiency level
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        proficiencyLevel: nextLevel,
      },
    });

    // Clear word cache for the user since they've changed levels
    // This ensures fresh data when they start the new level
    try {
      // Import dynamically to avoid circular dependencies
      const { wordCache } = await import("@/lib/word-cache");
      await wordCache.invalidateUserCache(user.id);
    } catch (error) {
      console.warn("Could not clear word cache:", error);
    }

    return NextResponse.json({
      success: true,
      previousLevel: currentLevel,
      newLevel: nextLevel,
      learnedWords: learnedWordsInLevel,
      message: `Congratulations! You've progressed to ${nextLevel} level!`,
    });
  } catch (error) {
    console.error("Error in level progression:", error);
    return NextResponse.json(
      { error: "An error occurred while progressing levels" },
      { status: 500 }
    );
  }
}

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
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentLevel = user.proficiencyLevel as ProficiencyLevel;
    const nextLevel = getNextLevel(currentLevel);

    // Get progress for current and next levels
    const levelProgress = [];

    for (const level of PROFICIENCY_LEVELS) {
      const learnedWordsInLevel = await prisma.word.count({
        where: {
          userId: user.id,
          proficiencyLevel: level,
          learned: true,
          learningLanguage: user.learningLanguage,
        },
      });

      const totalWordsInLevel = await prisma.word.count({
        where: {
          userId: user.id,
          proficiencyLevel: level,
          learningLanguage: user.learningLanguage,
        },
      });

      const percentage = (learnedWordsInLevel / WORDS_PER_LEVEL) * 100;
      const canProgress = canProgressToLevel(level as ProficiencyLevel, learnedWordsInLevel);
      const isCompleted = learnedWordsInLevel >= WORDS_PER_LEVEL;
      const isAccessible = level === currentLevel || PROFICIENCY_LEVELS.indexOf(level) < PROFICIENCY_LEVELS.indexOf(currentLevel);

      levelProgress.push({
        level,
        learnedWords: learnedWordsInLevel,
        totalWords: totalWordsInLevel,
        targetWords: WORDS_PER_LEVEL,
        percentage: Math.min(100, percentage),
        canProgress,
        isCompleted,
        isAccessible,
        isCurrent: level === currentLevel,
      });
    }

    return NextResponse.json({
      currentLevel,
      nextLevel,
      canProgressToNext: nextLevel ? canProgressToLevel(currentLevel, levelProgress.find(l => l.level === currentLevel)?.learnedWords || 0) : false,
      levelProgress,
    });
  } catch (error) {
    console.error("Error fetching level progress:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching level progress" },
      { status: 500 }
    );
  }
}