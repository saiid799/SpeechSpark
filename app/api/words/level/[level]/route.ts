// File: app/api/words/level/[level]/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { level: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const level = params.level;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        words: {
          where: { proficiencyLevel: level },
          select: {
            original: true,
            translation: true,
            learned: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ words: user.words });
  } catch (error) {
    console.error("Error fetching level words:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching level words" },
      { status: 500 }
    );
  }
}
