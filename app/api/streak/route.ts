import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { updateUserStreak, getUserStreakData } from "@/lib/streak-utils";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const streakData = await getUserStreakData(user.id);
    return NextResponse.json(streakData);
  } catch (error) {
    console.error("Error fetching streak data:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching streak data" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const streakData = await updateUserStreak(user.id);
    return NextResponse.json(streakData);
  } catch (error) {
    console.error("Error updating streak:", error);
    return NextResponse.json(
      { error: "An error occurred while updating streak" },
      { status: 500 }
    );
  }
}