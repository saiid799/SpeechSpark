// File: components/experience/ReviewMode.tsx

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Question } from "./Quiz";
import confetti from "canvas-confetti";
import {
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Brain,
  Sparkles,
  Medal,
  Star,
} from "lucide-react";

interface ReviewModeProps {
  mistakes: Question[];
  learningLanguage: string;
  nativeLanguage: string;
  onComplete: () => void;
}

interface WordStatus {
  correctCount: number;
  needsReview: boolean;
}

const ReviewMode: React.FC<ReviewModeProps> = ({
  mistakes,
  learningLanguage,
  nativeLanguage,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wordStatuses, setWordStatuses] = useState<Record<string, WordStatus>>(
    mistakes.reduce(
      (acc, q) => ({
        ...acc,
        [q.id]: { correctCount: 0, needsReview: true },
      }),
      {}
    )
  );
  const [reviewQueue, setReviewQueue] = useState<Question[]>(mistakes);
  const [progress, setProgress] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  const { speak, speaking } = useSpeechSynthesis();
  const currentQuestion = reviewQueue[currentIndex];

  const masteredWords = Object.values(wordStatuses).filter(
    (s) => s.correctCount >= 2
  ).length;
  const wordsInProgress = Object.values(wordStatuses).filter(
    (s) => s.correctCount === 1
  ).length;

  useEffect(() => {
    setProgress((masteredWords / mistakes.length) * 100);
  }, [masteredWords, mistakes.length]);

  useEffect(() => {
    if (currentQuestion) {
      const language =
        currentQuestion.questionLanguage === "native"
          ? nativeLanguage
          : learningLanguage;
      speak(currentQuestion.question, language);
    }
  }, [currentQuestion, nativeLanguage, learningLanguage, speak]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (selectedAnswer !== null) return;

      setSelectedAnswer(answer);
      const correct = answer === currentQuestion.correctAnswer;
      setIsCorrect(correct);
      setTotalAttempts((prev) => prev + 1);

      if (correct) {
        setWordStatuses((prev) => {
          const currentStatus = prev[currentQuestion.id];
          const newCorrectCount = (currentStatus?.correctCount || 0) + 1;

          return {
            ...prev,
            [currentQuestion.id]: {
              correctCount: newCorrectCount,
              needsReview: newCorrectCount < 2,
            },
          };
        });

        setCurrentStreak((prev) => prev + 1);
        if (currentStreak % 3 === 2) {
          confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.6 },
            colors: ["#16B981", "#6366F1", "#F59E0B"],
          });
        }

        speak("Well done!", learningLanguage);
      } else {
        setCurrentStreak(0);
        setWordStatuses((prev) => ({
          ...prev,
          [currentQuestion.id]: {
            correctCount: 0,
            needsReview: true,
          },
        }));
        speak("Let's practice this again", learningLanguage);
      }
    },
    [currentQuestion, learningLanguage, selectedAnswer, speak, currentStreak]
  );

  const handleNext = useCallback(() => {
    setSelectedAnswer(null);
    setIsCorrect(null);

    const remainingWords = mistakes.filter(
      (q) => wordStatuses[q.id]?.needsReview
    );

    if (remainingWords.length === 0) {
      onComplete();
      return;
    }

    const currentStatus = wordStatuses[currentQuestion.id];
    const updatedQueue = [...reviewQueue];

    if (currentStatus.needsReview) {
      // Move the current word to the end if it needs more practice
      updatedQueue.push(updatedQueue.splice(currentIndex, 1)[0]);
    } else {
      // Remove mastered word
      updatedQueue.splice(currentIndex, 1);
    }

    setReviewQueue(updatedQueue);
    setCurrentIndex((prev) =>
      updatedQueue.length === 1 ? 0 : Math.min(prev, updatedQueue.length - 1)
    );
  }, [
    currentIndex,
    currentQuestion?.id,
    mistakes,
    onComplete,
    reviewQueue,
    wordStatuses,
  ]);

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl shadow-lg">
      <CardContent className="p-8">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Header Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatsCard
              icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
              value={masteredWords}
              label="Mastered"
            />
            <StatsCard
              icon={<Brain className="w-5 h-5 text-yellow-500" />}
              value={wordsInProgress}
              label="In Progress"
            />
            <StatsCard
              icon={<Medal className="w-5 h-5 text-primary" />}
              value={currentStreak}
              label="Streak"
            />
            <StatsCard
              icon={<RefreshCw className="w-5 h-5 text-secondary" />}
              value={totalAttempts}
              label="Attempts"
            />
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Word Status */}
          {currentQuestion && (
            <div className="flex justify-center space-x-1">
              {[1, 2].map((req) => (
                <Star
                  key={req}
                  className={`w-5 h-5 ${
                    (wordStatuses[currentQuestion.id]?.correctCount || 0) >= req
                      ? "text-yellow-500 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-4"
            >
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
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
            </motion.div>
          </AnimatePresence>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion?.options.map((option, index) => (
              <motion.div
                key={option}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null || speaking}
                  className={`
                    w-full h-20 text-lg rounded-xl transition-all duration-300 relative group
                    ${
                      selectedAnswer === option
                        ? isCorrect
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-card hover:bg-primary/10"
                    }
                  `}
                >
                  <span>{option}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      const language =
                        currentQuestion.answerLanguage === "learning"
                          ? learningLanguage
                          : nativeLanguage;
                      speak(option, language);
                    }}
                    disabled={speaking}
                    className="absolute right-2 opacity-0 group-hover:opacity-100"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Feedback */}
          {selectedAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div
                className={`p-4 rounded-lg ${
                  isCorrect ? "bg-green-500/10" : "bg-red-500/10"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {isCorrect ? (
                    <>
                      <Sparkles className="w-5 h-5 text-green-500" />
                      <span className="text-green-700">
                        {wordStatuses[currentQuestion.id]?.correctCount === 2
                          ? "Perfect! You've mastered this word!"
                          : "Great job! One more correct answer to master this word."}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700">
                        The correct answer is: {currentQuestion.correctAnswer}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
};

const StatsCard: React.FC<{
  icon: React.ReactNode;
  value: number;
  label: string;
}> = ({ icon, value, label }) => (
  <div className="bg-primary/5 rounded-lg p-3 text-center">
    <div className="flex items-center justify-center mb-1">{icon}</div>
    <div className="font-bold text-xl">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

export default ReviewMode;
