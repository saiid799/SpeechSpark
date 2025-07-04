// File: components/experience/Quiz.tsx

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuizQuestions from "./QuizQuestions";
import ReviewMode from "./ReviewMode";
import CompletionPage from "./CompletionPage";
import WordIntroduction from "./WordIntroduction";
import SwipeContainer from "../SwipeContainer";
import { Question } from "@/types/word-learning";
import { initializeReviewState, ReviewState } from "./reviewManager";

interface QuizProps {
  questions: Question[];
  learningLanguage: string;
  nativeLanguage: string;
  wordId: string;
  onComplete: (stats: {
    correctAnswers: number;
    totalQuestions: number;
    streak: number;
  }) => void;
  showWordIntro?: boolean;
  word?: {
    original: string;
    translation: string;
  };
}

enum QuizPhase {
  INTRO = "intro",
  QUESTIONS = "questions",
  REVIEW = "review",
  COMPLETION = "completion",
}

const Quiz: React.FC<QuizProps> = ({
  questions,
  learningLanguage,
  nativeLanguage,
  wordId,
  onComplete,
  showWordIntro = false,
  word,
}) => {
  const [phase, setPhase] = useState<QuizPhase>(
    showWordIntro ? QuizPhase.INTRO : QuizPhase.QUESTIONS
  );
  const [mistakes, setMistakes] = useState<Question[]>([]);
  const [reviewState, setReviewState] = useState<ReviewState | null>(null);
  const [quizStats, setQuizStats] = useState({
    correctAnswers: 0,
    totalQuestions: questions.length,
    streak: 0,
    attempts: [] as { questionId: string; attempts: number }[],
  });

  const handleStartQuiz = useCallback(() => {
    setPhase(QuizPhase.QUESTIONS);
  }, []);

  const handleQuizComplete = useCallback(
    (stats: {
      correctAnswers: number;
      totalQuestions: number;
      streak: number;
      mistakes: Question[];
      attempts: { questionId: string; attempts: number }[];
    }) => {
      setQuizStats({
        ...stats,
        attempts: stats.attempts,
      });
      setMistakes(stats.mistakes);
      if (stats.mistakes.length > 0) {
        setReviewState(initializeReviewState(stats.mistakes));
        setPhase(QuizPhase.REVIEW);
      } else {
        setPhase(QuizPhase.COMPLETION);
      }
    },
    []
  );

  const handleReviewComplete = useCallback(() => {
    setPhase(QuizPhase.COMPLETION);
  }, []);

  const handleCompletion = useCallback(() => {
    onComplete({
      correctAnswers: quizStats.correctAnswers,
      totalQuestions: quizStats.totalQuestions,
      streak: quizStats.streak,
    });
  }, [onComplete, quizStats]);

  // Swipe navigation handlers
  const handleSwipeLeft = useCallback(() => {
    // Swipe left to go forward/next
    if (phase === QuizPhase.INTRO) {
      handleStartQuiz();
    } else if (phase === QuizPhase.REVIEW && reviewState) {
      handleReviewComplete();
    } else if (phase === QuizPhase.COMPLETION) {
      handleCompletion();
    }
  }, [phase, reviewState, handleStartQuiz, handleReviewComplete, handleCompletion]);

  const handleSwipeRight = useCallback(() => {
    // Swipe right to go back (limited cases)
    if (phase === QuizPhase.QUESTIONS && showWordIntro && word) {
      setPhase(QuizPhase.INTRO);
    }
  }, [phase, showWordIntro, word]);

  const canSwipeLeft = phase === QuizPhase.INTRO || phase === QuizPhase.REVIEW || phase === QuizPhase.COMPLETION;
  const canSwipeRight = phase === QuizPhase.QUESTIONS && showWordIntro;

  return (
    <SwipeContainer
      onSwipeLeft={canSwipeLeft ? handleSwipeLeft : undefined}
      onSwipeRight={canSwipeRight ? handleSwipeRight : undefined}
      threshold={100}
      className="min-h-[70vh]"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {phase === QuizPhase.INTRO && word ? (
            <WordIntroduction
              word={word.original}
              translation={word.translation}
              learningLanguage={learningLanguage}
              nativeLanguage={nativeLanguage}
              onStart={handleStartQuiz}
            />
          ) : phase === QuizPhase.REVIEW && reviewState ? (
            <ReviewMode
              mistakes={mistakes}
              learningLanguage={learningLanguage}
              nativeLanguage={nativeLanguage}
              onComplete={handleReviewComplete}
            />
          ) : phase === QuizPhase.COMPLETION && word ? (
            <CompletionPage
              word={word.original}
              translation={word.translation}
              learningLanguage={learningLanguage}
              nativeLanguage={nativeLanguage}
              stats={quizStats}
              wordId={wordId}
              onComplete={handleCompletion}
            />
          ) : (
            <QuizQuestions
              questions={questions}
              learningLanguage={learningLanguage}
              nativeLanguage={nativeLanguage}
              wordId={wordId}
              onComplete={handleQuizComplete}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </SwipeContainer>
  );
};

export default Quiz;
