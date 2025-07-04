import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { Volume2, CheckCircle } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import StarEvaluation from "@/components/evaluation/StarEvaluation";
import { toast } from "react-hot-toast";

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
  wordId: string;
  onComplete: () => void;
}

const CompletionPage: React.FC<CompletionPageProps> = ({
  word,
  translation,
  learningLanguage,
  stats,
  onComplete,
  wordId,
}) => {
  const { speak } = useSpeechSynthesis();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const updateWordStatus = async () => {
      setIsUpdatingStatus(true);
      try {
        const response = await fetch(`/api/words/${wordId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ learned: true }),
        });

        if (!response.ok) {
          throw new Error("Failed to update word status");
        }

        // Show success toast after successful update
        toast.success("Progress saved successfully!");

        // Dispatch event to notify Dashboard of word completion
        window.dispatchEvent(new CustomEvent("wordLearned"));

        // Trigger celebration effects
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#16B981", "#6366F1", "#F59E0B"],
        });

        speak("Congratulations on completing the word!", learningLanguage);
      } catch (error) {
        console.error("Error updating word status:", error);
        toast.error("Failed to save progress. Please try again.");
      } finally {
        setIsUpdatingStatus(false);
      }
    };

    updateWordStatus();
  }, [wordId, learningLanguage, speak]);

  const handleContinue = () => {
    if (!isUpdatingStatus) {
      onComplete();
    }
  };

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
            <CheckCircle className="w-10 h-10 text-white" />
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
          onContinue={handleContinue}
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
              disabled={isUpdatingStatus}
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Practice Pronunciation
            </Button>
          </div>
        </motion.div>

        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full text-lg"
            disabled={isUpdatingStatus}
          >
            Continue Learning
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletionPage;
