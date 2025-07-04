// File: types/word-learning.ts

export interface Question {
  id: string;
  wordId: string;
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

export interface LearningStats {
  totalAttempts: number;
  correctAnswers: number;
  streak: number;
  progress: number;
  completionTime: number;
  quizScore?: number;
}

export interface WordForm {
  form: string;
  translation: string;
  englishTransliteration: string;
  englishPronunciation: string;
}

export interface WordLearningExperienceProps {
  wordId: string;
  original: string;
  translation: string;
  learningLanguage: string;
  nativeLanguage: string;
  onComplete: () => void;
  isReview?: boolean;
}
