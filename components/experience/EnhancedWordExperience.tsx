// File: components/experience/EnhancedWordExperience.tsx

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Quiz from "./Quiz";
import { Card } from "@/components/ui/card";
import { useApi } from "@/hooks/useApi";
import { generateWordForms } from "@/lib/word-utils";
import {
  Question,
  WordForm,
  LearningStats,
  WordLearningExperienceProps,
} from "@/types/word-learning";
import { toast } from "react-hot-toast";
import { Star, Target, BarChart, Brain, Loader2 } from "lucide-react";

interface EnhancedWordExperienceProps
  extends Omit<WordLearningExperienceProps, "onProgress"> {
  onComplete: () => void;
}

const EnhancedWordExperience: React.FC<EnhancedWordExperienceProps> = ({
  wordIndex,
  original,
  translation,
  learningLanguage,
  nativeLanguage,
  onComplete,
}) => {
  const [learningStats, setLearningStats] = useState<LearningStats>({
    totalAttempts: 0,
    correctAnswers: 0,
    streak: 0,
    progress: 0,
    completionTime: 0,
  });
  const [startTime] = useState<number>(Date.now());
  const [questions, setQuestions] = useState<Question[]>([]);

  const {
    request: fetchWordForms,
    data: wordFormsData,
    isLoading,
  } = useApi<WordForm[]>();

  const updateWordStatus = useCallback(async () => {
    const response = await fetch(`/api/words/${wordIndex}/learn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to update word status");
    }
  }, [wordIndex]);

  const handleQuizComplete = useCallback(
    async (quizStats: {
      correctAnswers: number;
      totalQuestions: number;
      streak: number;
    }) => {
      const quizScore =
        (quizStats.correctAnswers / quizStats.totalQuestions) * 100;
      const completionTime = Math.floor((Date.now() - startTime) / 1000);

      setLearningStats((prev) => ({
        ...prev,
        quizScore,
        completionTime,
        correctAnswers: prev.correctAnswers + quizStats.correctAnswers,
        streak: Math.max(prev.streak, quizStats.streak),
      }));

      try {
        await updateWordStatus();
        toast.success("Congratulations! You've mastered this word! 🎉");
        await onComplete();
      } catch (error) {
        console.error("Error updating word status:", error);
        toast.error("Failed to save progress. Please try again.");
      }
    },
    [startTime, onComplete, updateWordStatus]
  );

  useEffect(() => {
    fetchWordForms(`/api/words/${wordIndex}/forms`);
  }, [wordIndex, fetchWordForms]);

  useEffect(() => {
    if (wordFormsData) {
      const generatedQuestions = generateWordForms(
        wordFormsData,
        learningLanguage,
        nativeLanguage,
        wordIndex
      );
      setQuestions(generatedQuestions);
    }
  }, [wordFormsData, learningLanguage, nativeLanguage, wordIndex]);

  const StatsDisplay = () => (
    <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm border border-foreground/10 rounded-2xl">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Star}
          value={learningStats.streak}
          label="Current Streak"
          color="text-yellow-500"
        />
        <StatCard
          icon={Target}
          value={`${Math.round(learningStats.progress)}%`}
          label="Progress"
          color="text-primary"
        />
        <StatCard
          icon={Brain}
          value={learningStats.correctAnswers}
          label="Mastered"
          color="text-secondary"
        />
        <StatCard
          icon={BarChart}
          value={learningStats.quizScore?.toFixed(1) || "0"}
          label="Quiz Score"
          color="text-accent"
          suffix="%"
        />
      </div>
    </Card>
  );

  if (isLoading || !wordFormsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-lg text-foreground/80">Preparing your lesson...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/10 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <AnimatePresence>
          {(learningStats.totalAttempts > 0 || learningStats.quizScore) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <StatsDisplay />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Quiz
              questions={questions}
              learningLanguage={learningLanguage}
              nativeLanguage={nativeLanguage}
              wordIndex={wordIndex}
              onComplete={handleQuizComplete}
              showWordIntro={true}
              word={{ original, translation }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  value,
  label,
  color,
  suffix = "",
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="relative overflow-hidden bg-card/50 backdrop-blur-sm border border-foreground/10 rounded-xl p-4 text-center group"
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
    </div>

    <div className="relative z-10">
      <Icon
        className={`w-6 h-6 ${color} mx-auto mb-2 transform group-hover:scale-110 transition-transform duration-300`}
      />
      <div className="text-xl font-bold group-hover:text-gradient bg-clip-text group-hover:text-transparent bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-300">
        {value}
        {suffix}
      </div>
      <div className="text-sm text-foreground/60 group-hover:text-foreground/80 transition-colors duration-300">
        {label}
      </div>
    </div>
  </motion.div>
);

export default EnhancedWordExperience;
