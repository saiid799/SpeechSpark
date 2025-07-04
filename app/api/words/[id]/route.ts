import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    // Validate ObjectID format (24 hex characters)
    if (!/^[0-9a-fA-F]{24}$/.test(wordId)) {
      return NextResponse.json({ error: "Invalid word ID format" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const word = await prisma.word.findFirst({
      where: {
        id: wordId,
        userId: user.id,
      },
    });

    if (!word) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    return NextResponse.json(word);
  } catch (error) {
    console.error("Error fetching word:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the word" },
      { status: 500 }
    );
  }
}
