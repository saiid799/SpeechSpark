// File: components/experience/CompletionPage.tsx

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { Volume2 } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import StarEvaluation from "@/components/evaluation/StarEvaluation";

interface CompletionPageProps {
  word: string;
  translation: string;
  learningLanguage: string;
  nativeLanguage: string;
  stats: {
    correctAnswers: number;
    totalQuestions: number;
    streak: number;
    attempts?: { questionId: string; attempts: number }[];
  };
  onContinue: () => void;
}

const CompletionPage: React.FC<CompletionPageProps> = ({
  word,
  translation,
  learningLanguage,
  stats,
  onContinue,
}) => {
  const { speak } = useSpeechSynthesis();

  useEffect(() => {
    const triggerCelebration = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#16B981", "#6366F1", "#F59E0B"],
      });
    };

    triggerCelebration();
    speak("Congratulations on completing the quiz!", learningLanguage);
  }, [speak, learningLanguage]);

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-background/80 to-primary/5 backdrop-blur-sm border border-primary/20 rounded-xl shadow-lg">
      <CardContent className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-6"
          >
            <div className="w-10 h-10 text-white">🎉</div>
          </motion.div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
            Excellent Progress!
          </h2>
          <p className="text-xl text-foreground/80 mt-2">
            You&apos;ve mastered <span className="font-semibold">{word}</span>
          </p>
        </motion.div>

        <StarEvaluation
          correctAnswers={stats.correctAnswers}
          totalQuestions={stats.totalQuestions}
          streak={stats.streak}
          attempts={stats.attempts}
          onContinue={onContinue}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-xl p-6 mt-8 mb-8"
        >
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-semibold text-foreground">{word}</h3>
            <p className="text-lg text-foreground/80">{translation}</p>
            <Button
              onClick={() => speak(word, learningLanguage)}
              className="bg-primary/20 hover:bg-primary/30 text-primary"
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Practice Pronunciation
            </Button>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default CompletionPage;
