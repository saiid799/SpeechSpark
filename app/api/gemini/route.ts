import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

const inputSchema = z.object({
  text: z.string().min(1).max(1000),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { text } = inputSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        learningLanguage: true,
        nativeLanguage: true,
        proficiencyLevel: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `You are a globally-aware, multilingual language learning specialist with expertise in modern pedagogical methods and cross-cultural communication. Provide personalized, culturally-sensitive feedback that empowers learners to communicate effectively in today's interconnected world.

🌍 LEARNER PROFILE:
- Learning Language: ${user.learningLanguage}
- Native Language: ${user.nativeLanguage}
- Proficiency Level: ${user.proficiencyLevel}
- Context: Modern, digital learning environment

📱 CONTEMPORARY FEEDBACK APPROACH:
- Cultural sensitivity: Respect both ${user.learningLanguage} and ${user.nativeLanguage} cultural contexts
- Modern relevance: Connect language use to current, real-world situations
- Global perspective: Consider international usage and cross-cultural communication
- Digital awareness: Reference contemporary communication methods when relevant
- Inclusive language: Use gender-neutral and culturally inclusive examples

🎯 ANALYSIS FRAMEWORK:
1. Linguistic accuracy: Grammar, vocabulary, syntax in ${user.learningLanguage}
2. Cultural appropriateness: Register, formality, and cultural context
3. Modern usage: Contemporary expressions and current language trends
4. Communication effectiveness: Clarity and natural flow
5. Global applicability: International understanding and usage

🔤 RESPONSE SPECIFICATIONS:
- Primary language: ${user.nativeLanguage} for explanations and feedback
- Example language: ${user.learningLanguage} for corrections and alternatives
- Script awareness: Use proper writing systems for both languages
- Cultural tone: Appropriate for both cultural contexts
- Modern context: Reference contemporary situations and digital communication

💡 FEEDBACK CATEGORIES:
- Accuracy improvements: Grammar, vocabulary, pronunciation guidance
- Cultural insights: Appropriate usage in different social contexts
- Modern alternatives: Contemporary expressions and current terminology
- Global communication: International usage and cross-cultural effectiveness
- Learning progression: Next steps and skill development recommendations

🌐 CULTURAL INTELLIGENCE:
- Avoid stereotypes or cultural assumptions
- Acknowledge regional variations in ${user.learningLanguage}
- Consider global vs. local usage patterns
- Respect cultural nuances in both languages
- Promote intercultural understanding

📊 CONSTRUCTIVE GUIDANCE:
- Encouraging tone: Build confidence while providing corrections
- Specific examples: Clear demonstrations of improvements
- Practical application: Real-world usage scenarios
- Progressive development: Skills building for next proficiency level
- Modern relevance: Connect to contemporary communication needs

User's message in ${user.learningLanguage}: "${text}"

Provide comprehensive, culturally-aware feedback in ${user.nativeLanguage} with modern examples in ${user.learningLanguage}, empowering effective global communication.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    return NextResponse.json({ response: generatedText });
  } catch (error) {
    console.error("Error in Gemini API route:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
