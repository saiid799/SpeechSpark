"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Headphones, ArrowRight, RefreshCw } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import Quiz from "./experience/Quiz";
import { Question, WordForm } from "@/types/word-learning";
import { toast } from "react-hot-toast";
import { generateWordForms } from "@/lib/word-utils";

interface WordLearningExperienceProps {
  wordIndex: number;
  original: string;
  translation: string;
  learningLanguage: string;
  nativeLanguage: string;
  onComplete: () => void;
  isReview?: boolean;
}

const WordLearningExperience: React.FC<WordLearningExperienceProps> = ({
  wordIndex,
  original,
  translation,
  learningLanguage,
  nativeLanguage,
  onComplete,
  isReview = false,
}) => {
  // State
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Hooks
  const { speak, speaking } = useSpeechSynthesis();
  const {
    request: fetchWordForms,
    data: wordFormsData,
    isLoading,
  } = useApi<WordForm[]>();

  // Load word forms
  useEffect(() => {
    fetchWordForms(`/api/words/${wordIndex}/forms`);
  }, [wordIndex, fetchWordForms]);

  // Generate questions when word forms are loaded
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

  // Handle completion of the learning experience
  const handleQuizComplete = useCallback(async () => {
    try {
      const response = await fetch(`/api/words/${wordIndex}/learn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to mark word as learned");
      }

      toast.success("Word successfully learned!");
      onComplete();
    } catch (error) {
      console.error("Error marking word as learned:", error);
      toast.error("Failed to save progress");
    }
  }, [wordIndex, onComplete]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Render step content
  const renderStep = () => {
    switch (step) {
      case 0: // Introduction
        return (
          <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              {isReview ? "Review" : "Learn"} &quot;{original}&quot;
            </h2>
            <p className="mb-8 text-xl sm:text-2xl text-foreground/80">
              Translation: {translation}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                onClick={() => speak(original, learningLanguage)}
                className="bg-primary/10 hover:bg-primary/20 text-primary text-lg py-3 px-6 rounded-full"
                disabled={speaking}
              >
                <Headphones className="mr-2 h-5 w-5" />
                Listen
              </Button>
              <Button
                onClick={() => setStep(1)}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-4 rounded-full"
              >
                Start {isReview ? "Review" : "Learning"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {isReview && (
              <p className="mt-6 text-sm text-muted-foreground">
                Review mode helps reinforce your learning through targeted
                practice
              </p>
            )}
          </Card>
        );

      case 1: // Quiz
        return (
          <Quiz
            questions={questions}
            learningLanguage={learningLanguage}
            nativeLanguage={nativeLanguage}
            wordIndex={wordIndex}
            onComplete={handleQuizComplete}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/10 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WordLearningExperience;
