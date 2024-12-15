import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    if (!user || !user.words[wordIndex]) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    const word = user.words[wordIndex];

    return NextResponse.json(word);
  } catch (error) {
    console.error("Error fetching word:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the word" },
      { status: 500 }
    );
  }
}
