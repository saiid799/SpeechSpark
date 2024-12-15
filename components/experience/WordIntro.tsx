// File: components/experience/WordIntro.tsx

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, ArrowRight, Lightbulb, Book } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface WordIntroProps {
  original: string;
  translation: string;
  learningLanguage: string;
  nativeLanguage: string;
  onContinue: () => void;
  isReview: boolean;
}

const WordIntro: React.FC<WordIntroProps> = ({
  original,
  translation,
  learningLanguage,
  nativeLanguage,
  onContinue,
  isReview,
}) => {
  const { speak, speaking } = useSpeechSynthesis();

  useEffect(() => {
    // Automatically speak the word when the component mounts
    speak(original, learningLanguage);
  }, [original, learningLanguage, speak]);

  return (
    <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl shadow-lg overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 opacity-30" />

      <motion.div className="relative z-10">
        {/* Mode indicator */}
        {isReview ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
              <Book className="w-4 h-4 mr-2" />
              Review Mode
            </span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Lightbulb className="w-4 h-4 mr-2" />
              New Word
            </span>
          </motion.div>
        )}

        {/* Word display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
            {original}
          </h2>
          <p className="text-2xl text-foreground/80">{translation}</p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <Button
            onClick={() => speak(original, learningLanguage)}
            disabled={speaking}
            className="w-full sm:w-auto bg-primary/10 hover:bg-primary/20 text-primary"
          >
            <Volume2 className="mr-2 h-5 w-5" />
            Listen in {learningLanguage}
          </Button>

          <Button
            onClick={() => speak(translation, nativeLanguage)}
            disabled={speaking}
            className="w-full sm:w-auto bg-secondary/10 hover:bg-secondary/20 text-secondary"
          >
            <Volume2 className="mr-2 h-5 w-5" />
            Listen in {nativeLanguage}
          </Button>

          <Button
            onClick={onContinue}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
          >
            Start {isReview ? "Review" : "Learning"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Learning tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-4 bg-secondary/5 rounded-lg"
        >
          <p className="text-sm text-secondary-foreground">
            <span className="font-semibold">Pro Tip:</span> Listen to the word
            multiple times and try to mimic the pronunciation. Pay attention to
            the stress and intonation.
          </p>
        </motion.div>
      </motion.div>
    </Card>
  );
};

export default WordIntro;
