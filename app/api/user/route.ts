// File: app/api/user/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getUserStreakData, checkAndResetStreakIfNeeded } from "@/lib/streak-utils";
import { WORDS_PER_LEVEL, PROFICIENCY_LEVELS, getCurrentBatch, canProgressToLevel, ProficiencyLevel, getCompletedBatches } from "@/lib/level-config";
import { performanceMonitor, measureApiPerformance } from "@/lib/performance-monitor";

const userSchema = z.object({
  clerkId: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  nativeLanguage: z.string(),
  learningLanguage: z.string(),
  proficiencyLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
});

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for throttling
    if (performanceMonitor.shouldThrottle('/api/user', userId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }
    
    return await measureApiPerformance('/api/user', async () => {

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        nativeLanguage: true,
        learningLanguage: true,
        proficiencyLevel: true,
        targetWordCount: true,
        currentBatch: true,
        currentPage: true,
        completedBatches: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
      },
    });

    // If user doesn't exist, redirect to onboarding
    if (!user) {
      return NextResponse.json({ 
        error: "User not found", 
        requiresOnboarding: true 
      }, { status: 404 });
    }

    // Check and reset streak if needed
    await checkAndResetStreakIfNeeded(user.id);

    // Get current streak data
    const streakData = await getUserStreakData(user.id);

    // Optimize with a single aggregation query instead of multiple counts
    const wordStats = await prisma.word.groupBy({
      by: ['proficiencyLevel', 'learned'],
      where: {
        userId: user.id,
        learningLanguage: user.learningLanguage,
      },
      _count: true,
    });

    // Process the aggregated results
    const learnedWordsByLevel = new Map<string, number>();
    let totalLearnedWords = 0;

    wordStats.forEach(stat => {
      if (stat.learned) {
        const count = stat._count;
        learnedWordsByLevel.set(stat.proficiencyLevel, count);
        totalLearnedWords += count;
      }
    });

    const learnedWords = totalLearnedWords;
    const learnedWordsInCurrentLevel = learnedWordsByLevel.get(user.proficiencyLevel) || 0;

    // Calculate completed levels efficiently
    const completedLevels = PROFICIENCY_LEVELS.filter(level => {
      const learnedInLevel = learnedWordsByLevel.get(level) || 0;
      return canProgressToLevel(level as ProficiencyLevel, learnedInLevel);
    });

    // Use the user's stored currentPage instead of calculating based on learned words
    const currentLearningPage = user.currentPage || 1;
    const currentLearningBatch = getCurrentBatch(learnedWordsInCurrentLevel);
    const completedBatchesInCurrentLevel = getCompletedBatches(learnedWordsInCurrentLevel);

    // Simplified progress and achievements for better performance
    // TODO: Implement proper daily progress tracking in a separate endpoint
    const averageAccuracy = 85; // Placeholder - calculate from actual data when needed
    
    // Generate basic achievements efficiently
    const achievements = [];
    if (streakData.currentStreak >= 7) {
      achievements.push({
        id: "streak-7",
        title: "Week Warrior",
        description: "Maintained a 7-day learning streak",
        date: new Date().toISOString(),
        type: "streak",
      });
    }
    
    if (learnedWords >= 100) {
      achievements.push({
        id: "words-100",
        title: "Century Milestone",
        description: "Learned 100 words",
        date: new Date().toISOString(),
        type: "milestone",
      });
    }

    // Add level completion achievements
    completedLevels.forEach((level) => {
      achievements.push({
        id: `level-${level}`,
        title: `${level} Mastered`,
        description: `Completed all words in level ${level}`,
        date: new Date().toISOString(),
        type: "completion",
      });
    });

    // Don't automatically update user's current page - let them control navigation
    // Only update completed batches if needed
    if (JSON.stringify(user.completedBatches) !== JSON.stringify(completedBatchesInCurrentLevel)) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          completedBatches: completedBatchesInCurrentLevel,
        },
      });
    }

    // Return optimized user progress data
    return NextResponse.json({
      ...user,
      learnedWords,
      completedLevels,
      currentLearningPage,
      currentLearningBatch,
      completedBatchesInCurrentLevel,
      achievements,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      todayCompleted: streakData.todayCompleted,
      averageAccuracy,
    });
    }, userId);
  } catch (error) {
    console.error("Error in user API route:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Merge Clerk user ID with request body
    const userData = {
      ...body,
      clerkId: userId,
    };

    // Validate input data
    const validatedData = userSchema.parse(userData);

    // Set target word count based on level
    const targetWordCount = WORDS_PER_LEVEL;

    // Create or update user
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        ...validatedData,
        targetWordCount,
      },
      create: {
        ...validatedData,
        targetWordCount,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error in user API route:", error);
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      return NextResponse.json(
        { error: "Validation error", details: errorMessages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPage } = body;

    if (!currentPage || typeof currentPage !== 'number') {
      return NextResponse.json({ error: "Invalid currentPage value" }, { status: 400 });
    }

    // Update user's current page
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: { currentPage },
    });

    return NextResponse.json({ 
      message: "Current page updated successfully",
      currentPage: updatedUser.currentPage 
    });
  } catch (error) {
    console.error("Error updating user page:", error);
    return NextResponse.json({ error: "Failed to update current page" }, { status: 500 });
  }
}
