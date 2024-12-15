// File: components/evaluation/StarEvaluation.tsx

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Award, Target, Zap, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateQuizPerformance, getStarColor } from "@/lib/evaluation-utils";
import type { QuizStats } from "@/lib/evaluation-utils";
import Link from "next/link";

interface StarEvaluationProps extends QuizStats {
  onAnimationComplete?: () => void;
  onContinue: () => void;
}

const StarEvaluation: React.FC<StarEvaluationProps> = ({
  correctAnswers,
  totalQuestions,
  streak,
  attempts,
  onAnimationComplete,
  onContinue,
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const performance = calculateQuizPerformance({
    correctAnswers,
    totalQuestions,
    streak,
    attempts,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      onAnimationComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative w-48 h-48 flex items-center justify-center"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="absolute inset-0 bg-primary/5 rounded-full" />
        <div className="flex space-x-2">
          {[...Array(5)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: index < performance.stars ? 1 : 0.3,
                scale: 1,
                rotate: [0, 20, -20, 0],
              }}
              transition={{
                delay: index * 0.1 + 0.5,
                duration: 0.5,
                rotate: { delay: index * 0.1 + 1, duration: 0.5 },
              }}
              className="relative"
            >
              <Star
                className={`w-12 h-12 ${
                  index < performance.stars
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
              {index < performance.stars && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 1 }}
                >
                  <Star
                    className={`w-12 h-12 bg-gradient-to-br ${getStarColor(
                      index
                    )} bg-clip-text text-transparent`}
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {!isAnimating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6"
          >
            <h3 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {performance.title}
            </h3>
            <p className="text-lg text-foreground/80">
              {performance.description}
            </p>

            <div className="grid grid-cols-3 gap-4">
              <StatCard
                icon={Target}
                value={`${performance.accuracy.toFixed(1)}%`}
                label="Accuracy"
                color="text-primary"
              />
              <StatCard
                icon={Award}
                value={streak.toString()}
                label="Best Streak"
                color="text-secondary"
              />
              <StatCard
                icon={Zap}
                value={correctAnswers.toString()}
                label="Correct Answers"
                color="text-accent"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full text-lg">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Learn New Word
                </Button>
              </Link>
              <Button
                onClick={onContinue}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 px-8 py-3 rounded-full text-lg"
              >
                Continue Reviewing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const StatCard: React.FC<{
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
}> = ({ icon: Icon, value, label, color }) => (
  <motion.div
    className="bg-card/50 backdrop-blur-sm rounded-xl p-4 text-center"
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
    <div className="text-xl font-bold">{value}</div>
    <div className="text-sm text-foreground/60">{label}</div>
  </motion.div>
);

export default StarEvaluation;
