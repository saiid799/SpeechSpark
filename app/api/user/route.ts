// File: app/api/user/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const userSchema = z.object({
  clerkId: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  nativeLanguage: z.string(),
  learningLanguage: z.string(),
  proficiencyLevel: z.enum(["A1", "A2"]), // Only allow A1 and A2
});

// Same word count for all levels
const wordsPerLevel = {
  A1: 1000,
  A2: 1000,
  B1: 1000,
  B2: 1000,
  C1: 1000,
};

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        nativeLanguage: true,
        learningLanguage: true,
        proficiencyLevel: true,
        targetWordCount: true,
        words: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate learned words for each level
    const learnedWords = user.words.filter((word) => word.learned).length;

    // Calculate completed levels (all words in level are learned)
    const completedLevels = ["A1", "A2"].filter((level) => {
      const wordsForLevel = user.words.filter(
        (w) => w.proficiencyLevel === level
      );
      const learnedWordsInLevel = wordsForLevel.filter((w) => w.learned).length;
      return (
        wordsForLevel.length > 0 &&
        learnedWordsInLevel ===
          wordsPerLevel[level as keyof typeof wordsPerLevel]
      );
    });

    // Generate daily progress data (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    const dailyProgress = [];
    const currentDate = new Date(thirtyDaysAgo);
    let streak = 0;

    while (currentDate <= new Date()) {
      // Get words learned on this day
      const dayStart = new Date(currentDate);

      // In a real app, you'd query based on actual learn dates
      // This is a simplified version for demonstration
      const wordsLearnedToday = Math.floor(Math.random() * 10); // Simulate 0-10 words learned
      const accuracy = Math.floor(Math.random() * 20) + 80; // Simulate 80-100% accuracy

      if (wordsLearnedToday > 0) {
        streak++;
      } else {
        streak = 0;
      }

      dailyProgress.push({
        date: dayStart.toISOString().split("T")[0],
        wordsLearned: wordsLearnedToday,
        accuracy,
        streak,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate achievements based on progress
    const achievements = [
      // Streak achievements
      ...(streak >= 7
        ? [
            {
              id: "streak-7",
              title: "Week Warrior",
              description: "Maintained a 7-day learning streak",
              date: new Date().toISOString(),
              type: "streak",
            },
          ]
        : []),

      // Word count achievements
      ...(learnedWords >= 100
        ? [
            {
              id: "words-100",
              title: "Century Milestone",
              description: "Learned 100 words",
              date: new Date().toISOString(),
              type: "milestone",
            },
          ]
        : []),

      // Level completion achievements
      ...completedLevels.map((level) => ({
        id: `level-${level}`,
        title: `${level} Mastered`,
        description: `Completed all words in level ${level}`,
        date: new Date().toISOString(),
        type: "completion",
      })),

      // High accuracy achievements
      ...(dailyProgress.some((day) => day.accuracy >= 95)
        ? [
            {
              id: "accuracy-95",
              title: "Precision Perfect",
              description: "Achieved 95% accuracy in practice",
              date: new Date().toISOString(),
              type: "accuracy",
            },
          ]
        : []),
    ];

    // Return complete user progress data
    return NextResponse.json({
      ...user,
      learnedWords,
      completedLevels,
      dailyProgress,
      achievements,
      currentStreak: streak,
      averageAccuracy: Math.round(
        dailyProgress.reduce((acc, day) => acc + day.accuracy, 0) /
          dailyProgress.length
      ),
    });
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
    const { userId } = auth();
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
    const targetWordCount =
      wordsPerLevel[
        validatedData.proficiencyLevel as keyof typeof wordsPerLevel
      ];

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
