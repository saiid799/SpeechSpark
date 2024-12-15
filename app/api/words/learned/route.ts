import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface Word {
  original: string;
  translation: string;
  learned: boolean;
  proficiencyLevel: string;
}

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { words: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const learnedWords = user.words.filter((word: Word) => word.learned);

    return NextResponse.json({ words: learnedWords });
  } catch (error) {
    console.error("Error fetching learned words:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching learned words" },
      { status: 500 }
    );
  }
}
