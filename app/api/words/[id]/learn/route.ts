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

    // First, get the current user and their words
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, words: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate the word index
    if (wordIndex < 0 || wordIndex >= user.words.length) {
      return NextResponse.json(
        { error: "Word index out of range" },
        { status: 400 }
      );
    }

    // Create a new array of words with the updated word
    const updatedWords = user.words.map((word, index) => {
      if (index === wordIndex) {
        console.log("Updating word:", {
          original: word.original,
          translation: word.translation,
          learned: true,
          proficiencyLevel: word.proficiencyLevel,
        });
        return {
          ...word,
          learned: true,
        };
      }
      return word;
    });

    // Update the user document with the new words array
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        words: updatedWords,
      },
      select: {
        words: true,
      },
    });

    console.log("Updated word status:", {
      wordIndex,
      originalWord: user.words[wordIndex],
      updatedWord: updatedUser.words[wordIndex],
    });

    return NextResponse.json({
      success: true,
      message: "Word marked as learned",
      updatedWord: updatedUser.words[wordIndex],
    });
  } catch (error) {
    console.error("Error in learn route:", error);
    return NextResponse.json(
      { error: "Failed to update word status" },
      { status: 500 }
    );
  }
}
