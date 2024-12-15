// File: components/experience/QuizPart3.tsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Check,
  X,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { ReviewItem } from "./reviewManager";

interface QuizPart3Props {
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  correctAnswer: string;
  onNextQuestion: () => void;
  speaking: boolean;
  progress: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  streak: number;
  isReviewMode: boolean;
  onRestartQuiz: () => void;
  reviewItem: ReviewItem | null;
}

const QuizPart3: React.FC<QuizPart3Props> = ({
  selectedAnswer,
  isCorrect,
  correctAnswer,
  onNextQuestion,
  speaking,
  progress,
  currentQuestionIndex,
  totalQuestions,
  streak,
  isReviewMode,
  onRestartQuiz,
  reviewItem,
}) => {
  return (
    <>
      <AnimatePresence>
        {selectedAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 text-center"
          >
            <motion.div
              className={`text-2xl font-semibold flex items-center justify-center mb-4 ${
                isCorrect ? "text-green-500" : "text-red-500"
              }`}
              animate={
                isCorrect ? { scale: [1, 1.2, 1] } : { x: [-5, 5, -5, 5, 0] }
              }
              transition={{ duration: 0.5 }}
            >
              {isCorrect ? (
                <>
                  <Check className="mr-2" /> Excellent!
                </>
              ) : (
                <>
                  <X className="mr-2" /> Not quite. The correct answer is:{" "}
                  <span className="font-bold ml-1">{correctAnswer}</span>
                </>
              )}
            </motion.div>
            <Button
              onClick={onNextQuestion}
              className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
              disabled={speaking}
            >
              {isReviewMode ? "Next Review" : "Next Question"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="text-lg font-semibold">Streak: {streak}</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>
        </div>
        <Progress value={progress} className="w-full h-2" />
        {isReviewMode && reviewItem && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Repetition: {reviewItem.repetitions}</span>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                Next review: {reviewItem.dueDate.toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
      {isReviewMode && (
        <div className="mt-6 text-center">
          <Button
            onClick={onRestartQuiz}
            className="bg-secondary hover:bg-secondary/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Restart Quiz
          </Button>
        </div>
      )}
    </>
  );
};

export default QuizPart3;
