// File: components/experience/Quiz.tsx

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Volume2, Brain, Trophy, Target, Zap } from "lucide-react";
import StarEvaluation from "../evaluation/StarEvaluation";
import ReviewMode from "./ReviewMode";
import PhrasePractice from "./PhrasePractice";
import WordIntro from "./WordIntro";
import QuizOptionCard from "./QuizOptionCard";
import { Question } from "@/types/word-learning";
import { initializeReviewState, ReviewState } from "./reviewManager";

interface QuizProps {
  questions: Question[];
  learningLanguage: string;
  nativeLanguage: string;
  wordIndex: number;
  onComplete: (stats: {
    correctAnswers: number;
    totalQuestions: number;
    streak: number;
    attempts: { questionId: string; attempts: number }[];
  }) => void;
}

enum QuizPhase {
  INTRO,
  QUESTIONS,
  PHRASE_PRACTICE,
  REVIEW,
  EVALUATION,
  COMPLETION,
}

const Quiz: React.FC<QuizProps> = ({
  questions,
  learningLanguage,
  nativeLanguage,
  wordIndex,
  onComplete,
}) => {
  // State
  const [phase, setPhase] = useState<QuizPhase>(QuizPhase.INTRO);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [mistakes, setMistakes] = useState<Question[]>([]);
  const [reviewState, setReviewState] = useState<ReviewState | null>(null);
  const [score, setScore] = useState(0);
  const [quizStats, setQuizStats] = useState({
    correctAnswers: 0,
    totalQuestions: questions.length,
    streak: 0,
    attempts: [] as { questionId: string; attempts: number }[],
  });

  // Hooks
  const { speak, speaking } = useSpeechSynthesis();

  // Memoized values
  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex],
    [questions, currentQuestionIndex]
  );

  const progress = useMemo(
    () => ((currentQuestionIndex + 1) / questions.length) * 100,
    [currentQuestionIndex, questions.length]
  );

  // Event handlers
  const handleAnswer = useCallback(
    (answer: string) => {
      if (selectedAnswer !== null) return;

      setSelectedAnswer(answer);
      const correct = answer === currentQuestion?.correctAnswer;
      setIsCorrect(correct);

      if (correct) {
        setQuizStats((prev) => {
          const newStreak = prev.streak + 1;
          const streakBonus = Math.min(newStreak * 10, 50);
          const basePoints = 100;
          const attempts =
            prev.attempts.find(
              (a) => a.questionId === `q-${currentQuestionIndex}`
            )?.attempts || 1;
          const attemptsMultiplier = 1 / attempts;
          const questionScore = (basePoints + streakBonus) * attemptsMultiplier;

          setScore((prevScore) => prevScore + Math.round(questionScore));

          if (newStreak > 0 && newStreak % 3 === 2) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#16B981", "#6366F1", "#F59E0B"],
            });
          }

          return {
            ...prev,
            correctAnswers: prev.correctAnswers + 1,
            streak: newStreak,
          };
        });

        speak("Excellent!", learningLanguage);
      } else {
        setMistakes((prev) => [...prev, currentQuestion]);
        setQuizStats((prev) => ({ ...prev, streak: 0 }));
        speak("Try again", learningLanguage);
      }

      setQuizStats((prev) => {
        const questionId = `q-${currentQuestionIndex}`;
        const currentAttempts = prev.attempts.find(
          (a) => a.questionId === questionId
        );
        return {
          ...prev,
          attempts: [
            ...prev.attempts.filter((a) => a.questionId !== questionId),
            {
              questionId,
              attempts: (currentAttempts?.attempts || 0) + 1,
            },
          ],
        };
      });
    },
    [currentQuestion, currentQuestionIndex, learningLanguage, speak]
  );

  const handlePhaseComplete = useCallback(() => {
    if (phase === QuizPhase.INTRO) {
      setPhase(QuizPhase.QUESTIONS);
    } else if (phase === QuizPhase.QUESTIONS) {
      if (mistakes.length > 0) {
        setReviewState(initializeReviewState(mistakes));
        setPhase(QuizPhase.REVIEW);
      } else {
        setPhase(QuizPhase.PHRASE_PRACTICE);
      }
    } else if (phase === QuizPhase.REVIEW) {
      setPhase(QuizPhase.PHRASE_PRACTICE);
    } else if (phase === QuizPhase.PHRASE_PRACTICE) {
      setPhase(QuizPhase.EVALUATION);
    } else if (phase === QuizPhase.EVALUATION) {
      onComplete(quizStats);
      setPhase(QuizPhase.COMPLETION);
    }
  }, [phase, mistakes, quizStats, onComplete]);

  const handleNext = useCallback(() => {
    if (selectedAnswer === null) return;

    if (currentQuestionIndex < questions.length - 1) {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handlePhaseComplete();
    }
  }, [
    currentQuestionIndex,
    questions.length,
    selectedAnswer,
    handlePhaseComplete,
  ]);

  // Phase-specific rendering
  if (phase === QuizPhase.INTRO) {
    return (
      <WordIntro
        original={currentQuestion.question}
        translation={currentQuestion.correctAnswer}
        learningLanguage={learningLanguage}
        nativeLanguage={nativeLanguage}
        onContinue={() => setPhase(QuizPhase.QUESTIONS)}
        isReview={false}
      />
    );
  }

  if (phase === QuizPhase.REVIEW && reviewState) {
    return (
      <ReviewMode
        mistakes={mistakes}
        learningLanguage={learningLanguage}
        nativeLanguage={nativeLanguage}
        onComplete={handlePhaseComplete}
      />
    );
  }

  if (phase === QuizPhase.PHRASE_PRACTICE) {
    return (
      <PhrasePractice
        word={currentQuestion.question}
        learningLanguage={learningLanguage}
        nativeLanguage={nativeLanguage}
        wordIndex={wordIndex}
        onComplete={handlePhaseComplete}
      />
    );
  }

  if (phase === QuizPhase.EVALUATION) {
    return (
      <StarEvaluation
        correctAnswers={quizStats.correctAnswers}
        totalQuestions={quizStats.totalQuestions}
        streak={quizStats.streak}
        attempts={quizStats.attempts}
        onContinue={handlePhaseComplete}
      />
    );
  }

  // Main quiz UI
  return (
    <Card className="w-full max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl shadow-lg">
      <CardContent className="p-8">
        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={Trophy}
            value={score}
            label="Points"
            color="text-yellow-500"
          />
          <StatsCard
            icon={Brain}
            value={quizStats.streak}
            label="Streak"
            color="text-primary"
          />
          <StatsCard
            icon={Target}
            value={Math.round(
              (quizStats.correctAnswers / quizStats.totalQuestions) * 100
            )}
            label="Accuracy"
            suffix="%"
            color="text-secondary"
          />
          <StatsCard
            icon={Zap}
            value={quizStats.correctAnswers}
            label="Correct"
            color="text-accent"
          />
        </div>

        {/* Question Section */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              {currentQuestion?.question}
            </h3>
            <Button
              onClick={() => {
                const language =
                  currentQuestion?.questionLanguage === "native"
                    ? nativeLanguage
                    : learningLanguage;
                speak(currentQuestion?.question, language);
              }}
              disabled={speaking}
              className="bg-primary/10 hover:bg-primary/20 text-primary"
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Listen Again
            </Button>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="wait">
              {currentQuestion?.options.map((option, index) => (
                <motion.div
                  key={option}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <QuizOptionCard
                    option={option}
                    isSelected={selectedAnswer === option}
                    isCorrect={selectedAnswer === option ? isCorrect : null}
                    onClick={() => handleAnswer(option)}
                    onSpeak={() => {
                      const language =
                        currentQuestion.answerLanguage === "learning"
                          ? learningLanguage
                          : nativeLanguage;
                      speak(option, language);
                    }}
                    disabled={selectedAnswer !== null || speaking}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Next Button */}
          {selectedAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <Button
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg rounded-full"
                disabled={speaking}
              >
                {currentQuestionIndex === questions.length - 1
                  ? mistakes.length > 0
                    ? "Start Review Mode"
                    : "Complete Quiz"
                  : "Continue"}
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Progress Bar */}
        <Progress value={progress} className="w-full mt-8" />
      </CardContent>
    </Card>
  );
};

interface StatsCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
  suffix?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  value,
  label,
  color,
  suffix = "",
}) => (
  <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-foreground/10">
    <Icon className={`w-5 h-5 ${color} mb-2`} />
    <div className="text-2xl font-bold">
      {value}
      {suffix}
    </div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

export default Quiz;
