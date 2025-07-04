import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { wordCache } from "@/lib/word-cache";


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
        learningLanguage: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Try to get learned words from cache first
    let learnedWords = await wordCache.getCachedLearnedWords(user.id);

    if (!learnedWords) {
      // If not cached, fetch from database
      learnedWords = await prisma.word.findMany({
        where: {
          userId: user.id,
          learned: true,
          learningLanguage: user.learningLanguage,
        },
        select: {
          id: true,
          original: true,
          translation: true,
          learned: true,
          proficiencyLevel: true,
          learningLanguage: true,
          nativeLanguage: true,
          userId: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Cache the results
      if (learnedWords.length > 0) {
        await wordCache.cacheLearnedWords(user.id, learnedWords);
      }
    }

    return NextResponse.json({ words: learnedWords });
  } catch (error) {
    console.error("Error fetching learned words:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching learned words" },
      { status: 500 }
    );
  }
}
