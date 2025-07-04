// File: app/api/words/[id]/forms/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

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
      select: {
        id: true,
        learningLanguage: true,
        nativeLanguage: true,
        proficiencyLevel: true,
      },
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

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const prompt = `You are an expert multilingual educator specializing in modern, practical language instruction across all global languages. Create 5 diverse, contemporary examples showing different forms and uses of the word "${word.original}" appropriate for ${user.proficiencyLevel} level learners.

🎯 TARGET SPECIFICATIONS:
Word: "${word.original}"
Learning Language: ${user.learningLanguage}
Native Language: ${user.nativeLanguage}
Proficiency Level: ${user.proficiencyLevel}

🌍 UNIVERSAL LANGUAGE REQUIREMENTS:
- Learning language content: ALL examples in ${user.learningLanguage}
- Translation language: ALL translations in ${user.nativeLanguage} (NEVER English unless native language IS English)
- Script awareness: Use proper writing systems (Arabic script, Chinese characters, Cyrillic, etc.)
- Cultural authenticity: Reflect modern, natural usage in ${user.learningLanguage}-speaking regions

📱 MODERN CONTENT STANDARDS:
1. Contemporary relevance: Use current, everyday situations (digital communication, modern lifestyle)
2. Diverse contexts: Show word usage across different social situations and registers
3. Progressive complexity: Start simple, gradually increase sophistication for proficiency level
4. Natural expressions: Include modern collocations, idioms, and common phrases
5. Global accessibility: Examples that work across different cultural contexts

🎨 FORMAT REQUIREMENTS:
- Clean presentation: NO parenthetical context like "(formal)", "(greeting)", "(plural form)"
- Pure content: Only the actual sentences/phrases without explanatory metadata
- Natural flow: Examples should sound like real, modern conversations
- No annotations: Avoid brackets, parentheses, or classification labels in the main content

🔤 PRONUNCIATION & TRANSLITERATION:
- English transliteration: Use standard romanization systems (Pinyin for Chinese, Hepburn for Japanese, etc.)
- Pronunciation guide: Phonetic approximations using English sounds for universal accessibility
- Script-sensitive: For non-Latin scripts, provide helpful romanization

💬 CONTEXTUAL VARIETY:
Include examples from different domains:
- Digital communication (texting, social media appropriate language)
- Daily interactions (greetings, shopping, dining)
- Professional contexts (work, education - at appropriate level)
- Social situations (friends, family, community)
- Cultural expressions (celebrations, traditions when relevant)

⚡ LANGUAGE-SPECIFIC ADAPTATIONS:
- Tonal languages: Consider tone in pronunciation guides
- Gendered languages: Show appropriate gender forms naturally
- Formal/informal registers: Demonstrate appropriate usage levels
- Regional variations: Use widely understood variants

📊 OUTPUT SPECIFICATION:
Return ONLY a valid JSON array without any additional text:
[
  {
    "form": "modern_natural_sentence_in_${user.learningLanguage}",
    "translation": "accurate_translation_in_${user.nativeLanguage}",
    "englishTransliteration": "standard_romanization_if_applicable",
    "englishPronunciation": "english_phonetic_guide"
  }
]

✅ QUALITY EXAMPLES:
${user.learningLanguage} example: "Te veo mañana en la oficina"
❌ Avoid: "Te veo mañana en la oficina (formal workplace goodbye)"

Generate 5 authentic, modern examples that demonstrate practical usage of "${word.original}" in contemporary ${user.learningLanguage}.`;

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
