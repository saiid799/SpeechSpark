// File: components/experience/QuizQuestions.tsx

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import {
  Brain,
  Trophy,
  Target,
  Zap,
  Volume2,
  ChevronRight,
  Star,
} from "lucide-react";
import QuizOptionCard from "./QuizOptionCard";
import { Question } from "@/types/word-learning";
import confetti from "canvas-confetti";

interface QuizQuestionsProps {
  questions: Question[];
  learningLanguage: string;
  nativeLanguage: string;
  wordIndex: number;
  onComplete: (stats: {
    correctAnswers: number;
    totalQuestions: number;
    streak: number;
    mistakes: Question[];
    attempts: { questionId: string; attempts: number }[];
  }) => void;
}

const QuizQuestions: React.FC<QuizQuestionsProps> = ({
  questions,
  learningLanguage,
  nativeLanguage,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [quizStats, setQuizStats] = useState({
    correctAnswers: 0,
    totalQuestions: questions.length,
    streak: 0,
    mistakes: [] as Question[],
    attempts: [] as { questionId: string; attempts: number }[],
  });

  const { speak, speaking } = useSpeechSynthesis();
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const getCurrentQuestionAttempts = useCallback(() => {
    const questionId = currentQuestion.id;
    const attemptRecord = quizStats.attempts.find(
      (a) => a.questionId === questionId
    );
    return attemptRecord ? attemptRecord.attempts : 0;
  }, [currentQuestion?.id, quizStats.attempts]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (selectedAnswer !== null) return;

      setSelectedAnswer(answer);
      const correct = answer === currentQuestion?.correctAnswer;
      setIsCorrect(correct);

      // Update attempts for current question
      const currentAttempts = getCurrentQuestionAttempts();
      const updatedAttempts = quizStats.attempts.filter(
        (a) => a.questionId !== currentQuestion.id
      );
      updatedAttempts.push({
        questionId: currentQuestion.id,
        attempts: currentAttempts + 1,
      });

      if (correct) {
        setQuizStats((prev) => ({
          ...prev,
          correctAnswers: prev.correctAnswers + 1,
          streak: prev.streak + 1,
          attempts: updatedAttempts,
        }));

        const streakBonus = Math.min(quizStats.streak * 10, 50);
        const basePoints = 100;
        const attemptPenalty = Math.max(0, currentAttempts * 10);
        const finalPoints = basePoints + streakBonus - attemptPenalty;
        setScore((prevScore) => prevScore + finalPoints);

        if (quizStats.streak > 0 && quizStats.streak % 3 === 2) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#16B981", "#6366F1", "#F59E0B"],
          });
        }

        speak("Excellent!", learningLanguage);
      } else {
        setQuizStats((prev) => ({
          ...prev,
          streak: 0,
          mistakes: [...prev.mistakes, currentQuestion],
          attempts: updatedAttempts,
        }));
        speak("Try again", learningLanguage);
      }
    },
    [
      currentQuestion,
      learningLanguage,
      quizStats.streak,
      selectedAnswer,
      speak,
      getCurrentQuestionAttempts,
    ]
  );

  const handleNext = useCallback(() => {
    if (selectedAnswer === null) return;

    if (currentQuestionIndex < questions.length - 1) {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      onComplete(quizStats);
    }
  }, [
    currentQuestionIndex,
    questions.length,
    selectedAnswer,
    quizStats,
    onComplete,
  ]);

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[120px] opacity-50"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-[1000px] h-[1000px] bg-secondary/5 rounded-full blur-[120px] opacity-50"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -45, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Main Card */}
      <Card className="relative overflow-hidden bg-background/40 backdrop-blur-xl border border-primary/20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/40 pointer-events-none" />

        <CardContent className="relative z-10 p-6 sm:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatsCard
              icon={Trophy}
              value={score}
              label="Points"
              color="text-yellow-500"
              bgColor="from-yellow-500/10 to-transparent"
            />
            <StatsCard
              icon={Brain}
              value={quizStats.streak}
              label="Streak"
              color="text-primary"
              bgColor="from-primary/10 to-transparent"
            />
            <StatsCard
              icon={Target}
              value={Math.round(
                (quizStats.correctAnswers / quizStats.totalQuestions) * 100
              )}
              label="Accuracy"
              suffix="%"
              color="text-secondary"
              bgColor="from-secondary/10 to-transparent"
            />
            <StatsCard
              icon={Zap}
              value={quizStats.correctAnswers}
              label="Correct"
              color="text-accent"
              bgColor="from-accent/10 to-transparent"
            />
          </div>

          {/* Question Section */}
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Question Header */}
            <div className="flex flex-col items-center">
              {/* Progress Dots */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="flex items-center gap-2">
                  {[...Array(questions.length)].map((_, idx) => (
                    <motion.div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        idx < currentQuestionIndex
                          ? "bg-primary"
                          : idx === currentQuestionIndex
                          ? "bg-primary ring-2 ring-primary/30"
                          : "bg-primary/20"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground/60">
                  {currentQuestionIndex + 1}/{questions.length}
                </span>
              </motion.div>

              {/* Question Text */}
              <div className="relative">
                <Star className="absolute -top-6 left-0 w-4 h-4 text-primary/40" />
                <Star className="absolute -bottom-6 right-0 w-4 h-4 text-secondary/40" />
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center px-8 py-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                  {currentQuestion?.question}
                </h3>
              </div>

              {/* Listen Button */}
              <Button
                onClick={() => {
                  const language =
                    currentQuestion?.questionLanguage === "native"
                      ? nativeLanguage
                      : learningLanguage;
                  speak(currentQuestion?.question, language);
                }}
                disabled={speaking}
                variant="outline"
                size="lg"
                className="mt-6 bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
              >
                <Volume2 className="mr-2 h-5 w-5 text-primary" />
                Listen Again
              </Button>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <AnimatePresence mode="wait">
                {currentQuestion?.options.map((option, index) => (
                  <motion.div
                    key={option}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
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
                className="flex justify-center mt-8"
              >
                <Button
                  onClick={handleNext}
                  className="group relative overflow-hidden h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={speaking}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative flex items-center">
                    {currentQuestionIndex === questions.length - 1 ? (
                      "Complete Quiz"
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Progress Bar */}
          <div className="mt-12 space-y-2">
            <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-sm text-foreground/60">
              <span>{Math.round(progress)}% Complete</span>
              <span>
                {questions.length - currentQuestionIndex - 1} Questions Left
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface StatsCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
  bgColor: string;
  suffix?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  value,
  label,
  color,
  bgColor,
  suffix = "",
}) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.02 }}
    className="relative overflow-hidden bg-card/30 backdrop-blur-sm rounded-xl p-4 border border-foreground/10 group hover:border-primary/30 transition-all duration-300"
  >
    <motion.div
      className={`absolute inset-0 bg-gradient-to-br ${bgColor} opacity-0 group-hover:opacity-100`}
      transition={{ duration: 0.3 }}
    />
    <div className="relative z-10">
      <Icon className={`w-5 h-5 ${color} mb-2`} />
      <div className="text-2xl font-bold text-foreground/90">
        {value}
        {suffix}
      </div>
      <div className="text-sm text-foreground/60">{label}</div>
    </div>
  </motion.div>
);

export default QuizQuestions;
