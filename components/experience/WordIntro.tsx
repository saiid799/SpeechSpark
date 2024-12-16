// File: components/experience/WordIntro.tsx

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Volume2,
  ArrowRight,
  Lightbulb,
  Book,
  GraduationCap,
  Sparkles,
  VolumeX,
  Play,
} from "lucide-react";
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
  const [hasListened, setHasListened] = useState(false);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTip(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Automatically speak the word when component mounts
    speak(original, learningLanguage);
    setHasListened(true);
  }, [original, learningLanguage, speak]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto px-4">
      <Card className="w-full relative overflow-hidden p-8 bg-gradient-to-br from-background/95 via-background/90 to-primary/5 backdrop-blur-lg border border-primary/20 rounded-2xl shadow-xl">
        {/* Background Animation */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          {/* Mode Indicator */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                ${
                  isReview
                    ? "bg-secondary/10 text-secondary border border-secondary/20"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}
            >
              {isReview ? (
                <>
                  <Book className="w-4 h-4 mr-2" />
                  Review Mode
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  New Word
                </>
              )}
            </span>
          </motion.div>

          {/* Main Word Display */}
          <div className="text-center space-y-6 mb-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative inline-block"
            >
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent mb-4">
                {original}
              </h2>
              {hasListened && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-8 -top-8"
                >
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </motion.div>
              )}
            </motion.div>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl text-foreground/80"
            >
              {translation}
            </motion.p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-4"
            >
              <Button
                onClick={() => {
                  speak(original, learningLanguage);
                  setHasListened(true);
                }}
                disabled={speaking}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
              >
                {speaking ? (
                  <VolumeX className="mr-2 h-5 w-5 animate-pulse" />
                ) : (
                  <Volume2 className="mr-2 h-5 w-5" />
                )}
                Listen in {learningLanguage}
              </Button>

              <Button
                onClick={() => speak(translation, nativeLanguage)}
                disabled={speaking}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-secondary/10 hover:bg-secondary/20 text-secondary border-secondary/20"
              >
                <Volume2 className="mr-2 h-5 w-5" />
                Listen in {nativeLanguage}
              </Button>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              <Button
                onClick={onContinue}
                size="lg"
                className="w-full sm:w-auto text-lg bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="mr-2 h-5 w-5" />
                Start {isReview ? "Review" : "Learning"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>

          {/* Learning Tips */}
          <AnimatePresence>
            {showTip && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.6 }}
                className="mt-8 p-4 bg-gradient-to-r from-secondary/5 via-secondary/10 to-secondary/5 rounded-xl border border-secondary/20"
              >
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-6 h-6 text-secondary mt-1" />
                  <div>
                    <p className="text-secondary font-semibold mb-1">Pro Tip</p>
                    <p className="text-foreground/80">
                      Listen to the word multiple times and try to mimic the
                      pronunciation. Pay attention to the stress and intonation
                      patterns.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Card>
    </div>
  );
};

export default WordIntro;
