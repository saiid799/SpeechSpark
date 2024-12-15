import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface Word {
  learned: boolean;
  proficiencyLevel: string;
}

const wordsPerLevel = {
  A1: 1000,
  A2: 2000,
  B1: 3000,
  B2: 4000,
  C1: 5000,
};

const userSchema = z.object({
  clerkId: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  nativeLanguage: z.string(),
  learningLanguage: z.string(),
  proficiencyLevel: z.enum(["A1", "A2", "B1", "B2", "C1"]),
});

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        nativeLanguage: true,
        learningLanguage: true,
        proficiencyLevel: true,
        targetWordCount: true,
        words: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const learnedWords = user.words.filter((word: Word) => word.learned).length;

    const completedLevels = Object.keys(wordsPerLevel).filter(
      (level) =>
        level <= user.proficiencyLevel &&
        user.words.filter(
          (w: Word) => w.proficiencyLevel === level && w.learned
        ).length === wordsPerLevel[level as keyof typeof wordsPerLevel]
    );

    return NextResponse.json({
      ...user,
      learnedWords,
      completedLevels,
    });
  } catch (error) {
    console.error("Error in user API route:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Merge Clerk user ID with request body
    const userData = {
      ...body,
      clerkId: userId,
    };

    const validatedData = userSchema.parse(userData);
    const targetWordCount =
      wordsPerLevel[
        validatedData.proficiencyLevel as keyof typeof wordsPerLevel
      ];

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: { ...validatedData, targetWordCount },
      create: { ...validatedData, targetWordCount },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error in user API route:", error);
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      return NextResponse.json(
        { error: "Validation error", details: errorMessages },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
