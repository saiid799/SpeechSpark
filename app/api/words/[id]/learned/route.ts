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

    // Get the user and their words
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        words: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate word index
    if (wordIndex < 0 || wordIndex >= user.words.length) {
      return NextResponse.json(
        { error: "Word index out of range" },
        { status: 400 }
      );
    }

    // Create a new array with the updated word
    const updatedWords = user.words.map((word, index) => {
      if (index === wordIndex) {
        return {
          ...word,
          learned: true,
        };
      }
      return word;
    });

    // Update the user's words in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        words: updatedWords,
      },
    });

    // Log the update for debugging
    console.log(
      `Word at index ${wordIndex} marked as learned for user ${user.id}`
    );
    console.log("Updated word:", updatedWords[wordIndex]);

    return NextResponse.json({
      success: true,
      message: "Word marked as learned successfully",
      word: updatedWords[wordIndex],
    });
  } catch (error) {
    console.error("Error marking word as learned:", error);
    return NextResponse.json(
      { error: "An error occurred while updating word status" },
      { status: 500 }
    );
  }
}
