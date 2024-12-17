import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NotificationItem } from "@/types/notification";
import { Prisma } from "@prisma/client";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function GET() {
  try {
    const { userId } = auth();
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
    const { userId } = auth();
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate a motivational message for language learning. The message should be in ${user.learningLanguage} with its translation in ${user.nativeLanguage}. The message should be encouraging, positive, and motivate the user to continue learning. Format the response as a JSON object with 'learningLanguageText' and 'nativeLanguageText' properties.`;

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
    const { userId } = auth();
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
    const { userId } = auth();
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
