import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  learned: z.boolean(),
});

export async function PATCH(
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

    const body = await request.json();
    const { learned } = updateSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { words: true },
    });

    if (!user || !user.words[wordIndex]) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    const updatedWords = [...user.words];
    updatedWords[wordIndex] = { ...updatedWords[wordIndex], learned };

    await prisma.user.update({
      where: { clerkId: userId },
      data: { words: updatedWords },
    });

    return NextResponse.json({ message: "Word status updated successfully" });
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
