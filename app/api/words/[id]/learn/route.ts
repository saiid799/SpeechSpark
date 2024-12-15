// File: app/api/words/[id]/learn/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wordIndex = parseInt(params.id);

    if (isNaN(wordIndex)) {
      return NextResponse.json(
        { error: "Invalid word index" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { words: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (wordIndex < 0 || wordIndex >= user.words.length) {
      return NextResponse.json(
        { error: "Word index out of range" },
        { status: 400 }
      );
    }

    const updatedWords = [...user.words];
    updatedWords[wordIndex] = { ...updatedWords[wordIndex], learned: true };

    await prisma.user.update({
      where: { clerkId: userId },
      data: { words: updatedWords },
    });

    return NextResponse.json({ message: "Word marked as learned" });
  } catch (error) {
    console.error("Error marking word as learned:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
