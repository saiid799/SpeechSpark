import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { invalidateWordCache } from "@/lib/word-cache";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const wordId = resolvedParams.id;

    // Get the user 
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find and update the word
    const word = await prisma.word.findFirst({
      where: {
        id: wordId,
        userId: user.id,
      },
    });

    if (!word) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    // Update the word's learned status
    const updatedWord = await prisma.word.update({
      where: { id: wordId },
      data: { learned: true },
    });

    // Invalidate user's word cache since learned status changed
    await invalidateWordCache.user(user.id);

    console.log("Updated word status:", {
      wordId,
      originalWord: word,
      updatedWord: updatedWord,
    });

    return NextResponse.json({
      success: true,
      message: "Word marked as learned",
      updatedWord: updatedWord,
    });
  } catch (error) {
    console.error("Error in learn route:", error);
    return NextResponse.json(
      { error: "Failed to update word status" },
      { status: 500 }
    );
  }
}
