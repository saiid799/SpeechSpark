// File: types/word-learning.ts

export interface Question {
  id: string;
  wordIndex: number; // Added this field
  question: string;
  options: string[];
  correctAnswer: string;
  questionLanguage: "native" | "learning";
  answerLanguage: "native" | "learning";
}

export interface QuizStats {
  correctAnswers: number;
  totalQuestions: number;
  streak: number;
  attempts?: { questionId: string; attempts: number }[];
}

export interface WordForm {
  form: string;
  translation: string;
}
