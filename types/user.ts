// File: types/user.ts

import { Word } from "./word";

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  nativeLanguage: string;
  learningLanguage: string;
  proficiencyLevel: string;
  targetWordCount: number;
  words: Word[];
  createdAt: Date;
  updatedAt: Date;
}
