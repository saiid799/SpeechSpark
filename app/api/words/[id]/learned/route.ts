import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { updateUserStreak } from "@/lib/streak-utils";
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

    // Update user streak for completing learning activity
    const streakData = await updateUserStreak(user.id);

    // Invalidate specific batch cache and user caches since learned status changed
    await invalidateWordCache.batch(user.id, updatedWord.proficiencyLevel, updatedWord.batchNumber);
    await invalidateWordCache.user(user.id);

    // Log the update for debugging
    console.log(
      `Word ${wordId} marked as learned for user ${user.id}`
    );
    console.log("Updated word:", updatedWord);
    console.log("Streak updated:", streakData);

    return NextResponse.json({
      success: true,
      message: "Word marked as learned successfully",
      word: updatedWord,
      streak: streakData,
    });
  } catch (error) {
    console.error("Error marking word as learned:", error);
    return NextResponse.json(
      { error: "An error occurred while updating word status" },
      { status: 500 }
    );
  }
}
