// File: app/api/words/[id]/forms/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

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
      select: {
        words: true,
        learningLanguage: true,
        nativeLanguage: true,
        proficiencyLevel: true,
      },
    });

    if (!user || !user.words[wordIndex]) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    const word = user.words[wordIndex];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate 5 simple forms or uses of the word "${word.original}" in ${user.learningLanguage} at ${user.proficiencyLevel} level. Provide translations in ${user.nativeLanguage} and English transliterations. 
    Respond only with a JSON array in this format: 
    [
      {
        "form": "form or use in ${user.learningLanguage}",
        "translation": "translation in ${user.nativeLanguage}",
        "englishTransliteration": "English transliteration",
        "englishPronunciation": "English pronunciation guide"
      },
      ...
    ]`;

    const result = await model.generateContent(prompt);
    const generatedContent = await result.response.text();

    // Remove any unexpected characters before and after the JSON content
    const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Generated content does not contain valid JSON");
    }

    const jsonContent = jsonMatch[0];
    let wordForms: {
      form: string;
      translation: string;
      englishTransliteration: string;
      englishPronunciation: string;
    }[];

    try {
      wordForms = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Parsing error:", parseError);
      console.error("Generated content:", generatedContent);
      throw new Error("Unable to parse generated content as JSON");
    }

    if (!Array.isArray(wordForms) || wordForms.length === 0) {
      throw new Error(
        "Generated content does not contain any valid word forms"
      );
    }

    return NextResponse.json(wordForms);
  } catch (error) {
    console.error("Error generating word forms:", error);
    return NextResponse.json(
      { error: "An error occurred while generating word forms" },
      { status: 500 }
    );
  }
}
