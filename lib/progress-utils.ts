// File: lib/progress-utils.ts

import { prisma } from "@/lib/prisma";

interface DailyStats {
  date: string;
  wordsLearned: number;
  accuracy: number;
  streak: number;
}

export async function calculateDailyProgress(
  userId: string,
  startDate: Date
): Promise<DailyStats[]> {
  const user = await prisma.user.findFirst({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) throw new Error("User not found");

  // Get words learned
  const wordsResponse = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      words: {
        select: {
          learned: true,
        },
      },
    },
  });

  if (!wordsResponse) {
    throw new Error("No words data found");
  }

  // Generate daily stats
  const dailyStats: DailyStats[] = [];
  let streak = 0;
  const currentDate = new Date();

  // Calculate stats for each day
  while (currentDate >= startDate) {
    // Simulate word learning data for the day
    // In a real app, you'd use actual timestamps from the database
    const learnedWordsForDay = Math.floor(Math.random() * 10); // 0-9 words

    if (learnedWordsForDay > 0) {
      streak++;
    } else {
      streak = 0;
    }

    const accuracy = Math.random() * 20 + 80; // 80-100%

    dailyStats.push({
      date: currentDate.toISOString().split("T")[0],
      wordsLearned: learnedWordsForDay,
      accuracy,
      streak,
    });

    // Move to previous day
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return dailyStats;
}
