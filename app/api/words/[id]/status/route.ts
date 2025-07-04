import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { updateUserStreak } from "@/lib/streak-utils";
import { invalidateWordCache } from "@/lib/word-cache";

const updateSchema = z.object({
  learned: z.boolean(),
});

export async function PATCH(
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

    const body = await request.json();
    const { learned } = updateSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
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

    await prisma.word.update({
      where: { id: wordId },
      data: { learned },
    });

    // Update streak if word is being marked as learned
    let streakData = null;
    if (learned) {
      streakData = await updateUserStreak(user.id);
    }

    // Invalidate user's word cache since learned status changed
    await invalidateWordCache.user(user.id);

    return NextResponse.json({ 
      message: "Word status updated successfully",
      streak: streakData 
    });
  } catch (error) {
    console.error("Error updating word status:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred while updating word status" },
      { status: 500 }
    );
  }
}
