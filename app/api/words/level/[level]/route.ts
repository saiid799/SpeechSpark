// File: app/api/words/level/[level]/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ level: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const level = resolvedParams.level;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        learningLanguage: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get words by proficiency level from database
    const levelWords = await prisma.word.findMany({
      where: {
        userId: user.id,
        proficiencyLevel: level,
        learningLanguage: user.learningLanguage,
      },
      select: {
        id: true,
        original: true,
        translation: true,
        learned: true,
        proficiencyLevel: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ words: levelWords });
  } catch (error) {
    console.error("Error fetching level words:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching level words" },
      { status: 500 }
    );
  }
}
