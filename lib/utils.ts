// File: lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { User } from "@/types/user";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isUserProfileComplete = (user: Partial<User>): boolean => {
  return !!(
    user.nativeLanguage &&
    user.learningLanguage &&
    user.proficiencyLevel &&
    user.targetWordCount
  );
};

export const getUserProfileCompletion = (user: Partial<User>): string[] => {
  const missingFields: string[] = [];
  if (!user.nativeLanguage) missingFields.push("Native Language");
  if (!user.learningLanguage) missingFields.push("Learning Language");
  if (!user.proficiencyLevel) missingFields.push("Proficiency Level");
  if (user.targetWordCount === undefined)
    missingFields.push("Target Word Count");
  return missingFields;
};
