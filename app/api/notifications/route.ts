import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NotificationItem } from "@/types/notification";
import { Prisma } from "@prisma/client";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        notifications: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notifications = user.notifications as unknown as NotificationItem[];
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        learningLanguage: true,
        nativeLanguage: true,
        notifications: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `You are a globally-aware, culturally-sensitive language learning mentor who creates modern, inspiring messages for learners worldwide. Generate a motivational message that resonates with contemporary language learners and reflects modern global connectivity.

🌍 GLOBAL CONTEXT:
Learning Language: ${user.learningLanguage}
Native Language: ${user.nativeLanguage}
Modern Learning Environment: Digital, interconnected, multicultural

📱 CONTEMPORARY MOTIVATION THEMES:
- Global connectivity and cross-cultural communication
- Digital learning opportunities and online communities
- Career advancement and international opportunities
- Cultural appreciation and global citizenship
- Personal growth through multilingual competence
- Technology-enhanced learning experiences

🎯 MESSAGE REQUIREMENTS:
1. Contemporary relevance: Reference modern learning contexts and global opportunities
2. Cultural authenticity: Use culturally appropriate motivational concepts for both languages
3. Personal empowerment: Focus on individual growth and achievement potential
4. Global perspective: Emphasize connection and communication across cultures
5. Practical benefits: Highlight real-world applications of language skills
6. Modern lifestyle: Reflect today's digital, mobile, connected world

🔤 LINGUISTIC SPECIFICATIONS:
- ${user.learningLanguage} text: Use contemporary, natural expressions
- ${user.nativeLanguage} text: Provide culturally appropriate motivational language
- Script awareness: Use proper writing systems and modern orthography
- Register: Appropriate formality for encouraging, supportive communication
- Length: Concise but impactful (2-3 sentences maximum)

🌐 CULTURAL SENSITIVITY:
- Reflect positive aspects of ${user.learningLanguage}-speaking cultures
- Use motivational concepts that resonate globally
- Include universal themes while respecting cultural specificity
- Avoid stereotypes or overgeneralizations
- Emphasize mutual cultural appreciation

💡 MODERN LANGUAGE LEARNING CONTEXT:
- AI-powered learning tools and personalized education
- Global remote work and international collaboration
- Social media and digital communication
- Virtual cultural exchange and online communities
- Sustainable and inclusive global communication

📊 OUTPUT SPECIFICATION:
Return ONLY a valid JSON object without additional text:
{
  "learningLanguageText": "inspiring_contemporary_message_in_${user.learningLanguage}",
  "nativeLanguageText": "culturally_appropriate_motivation_in_${user.nativeLanguage}"
}

Generate one inspiring message that motivates continued learning in our globally connected, digitally-enhanced world.`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // Parse the JSON from the response
    const messageData = JSON.parse(response);

    const newNotification: NotificationItem = {
      id: `notification-${Date.now()}`,
      learningLanguageText: messageData.learningLanguageText,
      nativeLanguageText: messageData.nativeLanguageText,
      learningLanguage: user.learningLanguage,
      nativeLanguage: user.nativeLanguage,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const currentNotifications =
      (user.notifications as unknown as NotificationItem[]) || [];
    const updatedNotifications = [
      newNotification,
      ...currentNotifications.slice(0, 49), // Keep last 50 notifications
    ];

    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        notifications: {
          set: updatedNotifications as unknown as Prisma.InputJsonValue[],
        },
      },
    });

    return NextResponse.json(newNotification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId } = body;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        notifications: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentNotifications =
      user.notifications as unknown as NotificationItem[];
    const updatedNotifications = currentNotifications.map(
      (notification: NotificationItem) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
    );

    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        notifications: {
          set: updatedNotifications as unknown as Prisma.InputJsonValue[],
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        notifications: {
          set: [],
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return NextResponse.json(
      { error: "Failed to clear notifications" },
      { status: 500 }
    );
  }
}
