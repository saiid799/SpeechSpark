import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function ensureUserExists() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error("User not authenticated");
  }

  // Check if user exists in database
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  // If user doesn't exist, create them with basic info from Clerk
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        // Default values - user will complete onboarding
        nativeLanguage: "English",
        learningLanguage: "Spanish", 
        proficiencyLevel: "A1",
        targetWordCount: 1000,
      },
    });
  }

  return user;
}