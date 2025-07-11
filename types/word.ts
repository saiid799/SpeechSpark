// File: types/word.ts

export interface Word {
  id: string;
  original: string;
  translation: string;
  learned: boolean;
  proficiencyLevel: string;
  learningLanguage: string;
  nativeLanguage: string;
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface GeneratedWord {
  original: string;
  translation: string;
}

export interface WordData {
  words: Word[];
  totalPages: number;
  currentPage: number;
  progress: string;
  currentBatch: string;
  proficiencyLevel: string;
}

export interface WordsResponse {
  words: Word[];
  currentPage: number;
  totalPages: number;
  progress: string;
  currentBatch: string;
  proficiencyLevel: string;
}

export interface WordStats {
  learnedWords: number;
  totalWords: number;
  progress: number;
}

export interface Language {
  name: string;
  code: string;
  flag: string;
}