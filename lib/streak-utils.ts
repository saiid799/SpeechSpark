import { prisma } from "@/lib/prisma";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
  todayCompleted: boolean;
}

/**
 * Calculates the current streak for a user based on daily activities
 */
export async function calculateCurrentStreak(userId: string): Promise<number> {
  const activities = await prisma.dailyActivity.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 100, // Get last 100 days to calculate streak
  });

  if (activities.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Start from today or yesterday
  let currentDate = new Date(today);
  const firstActivityDate = new Date(activities[0].date);
  firstActivityDate.setHours(0, 0, 0, 0);

  // If no activity today, start from yesterday
  if (firstActivityDate.getTime() !== today.getTime()) {
    currentDate = new Date(yesterday);
  }

  // Count consecutive days backwards
  for (const activity of activities) {
    const activityDate = new Date(activity.date);
    activityDate.setHours(0, 0, 0, 0);

    if (activityDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Updates user streak data when they complete learning activities
 */
export async function updateUserStreak(userId: string): Promise<StreakData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if user already has activity for today
  const todayActivity = await prisma.dailyActivity.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  // If no activity today, create one
  if (!todayActivity) {
    await prisma.dailyActivity.create({
      data: {
        userId,
        date: today,
        wordsLearned: 1,
      },
    });
  } else {
    // Update existing activity
    await prisma.dailyActivity.update({
      where: { id: todayActivity.id },
      data: {
        wordsLearned: { increment: 1 },
      },
    });
  }

  // Calculate current streak
  const currentStreak = await calculateCurrentStreak(userId);

  // Get user's longest streak
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { longestStreak: true },
  });

  const longestStreak = Math.max(currentStreak, user?.longestStreak || 0);

  // Update user streak data
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak,
      longestStreak,
      lastActiveDate: new Date(),
    },
  });

  return {
    currentStreak,
    longestStreak,
    lastActiveDate: new Date(),
    todayCompleted: true,
  };
}

/**
 * Gets streak data for a user
 */
export async function getUserStreakData(userId: string): Promise<StreakData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActiveDate: true,
    },
  });

  if (!user) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      todayCompleted: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayActivity = await prisma.dailyActivity.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  return {
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastActiveDate: user.lastActiveDate,
    todayCompleted: !!todayActivity,
  };
}

/**
 * Checks if streak should be reset (if user missed yesterday)
 */
export async function checkAndResetStreakIfNeeded(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastActiveDate: true, currentStreak: true },
  });

  if (!user?.lastActiveDate || user.currentStreak === 0) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastActive = new Date(user.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);

  // If last active was before yesterday, reset streak
  if (lastActive.getTime() < yesterday.getTime()) {
    await prisma.user.update({
      where: { id: userId },
      data: { currentStreak: 0 },
    });
  }
}