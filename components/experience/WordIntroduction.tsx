// File: components/experience/WordIntroduction.tsx

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Volume2,
  ChevronRight,
  Sparkles,
  GraduationCap,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface WordIntroductionProps {
  word: string;
  translation: string;
  learningLanguage: string;
  nativeLanguage: string;
  onStart: () => void;
}

const WordIntroduction: React.FC<WordIntroductionProps> = ({
  word,
  translation,
  learningLanguage,
  nativeLanguage,
  onStart,
}) => {
  const { speak, speaking } = useSpeechSynthesis();
  const [hasListened, setHasListened] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      speak(word, learningLanguage);
      setHasListened(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [word, learningLanguage, speak]);

  useEffect(() => {
    if (hasListened) {
      const timer = setTimeout(() => {
        setShowTips(true);
        setIsReady(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasListened]);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <Card className="relative overflow-hidden bg-background/60 backdrop-blur-xl border border-primary/10 shadow-xl">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-20"
            animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <div className="p-8 sm:p-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="h-px w-12 bg-primary/30" />
            <Sparkles className="w-5 h-5 text-primary/60" />
            <span className="text-base text-primary/80 font-medium tracking-wide uppercase">
              New Word
            </span>
            <Sparkles className="w-5 h-5 text-primary/60" />
            <div className="h-px w-12 bg-primary/30" />
          </motion.div>

          {/* Word Display */}
          <div className="text-center mb-10">
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {word}
            </motion.h1>
            <motion.p
              className="text-2xl sm:text-3xl text-foreground/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {translation}
            </motion.p>
          </div>

          {/* Pronunciation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-10"
          >
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                speak(word, learningLanguage);
                setHasListened(true);
              }}
              className="bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30 h-14 px-6 text-lg"
              disabled={speaking}
            >
              <Volume2 className="mr-2 h-5 w-5 text-primary" />
              Listen in {learningLanguage}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => speak(translation, nativeLanguage)}
              className="bg-secondary/5 border-secondary/20 hover:bg-secondary/10 hover:border-secondary/30 h-14 px-6 text-lg"
              disabled={speaking}
            >
              <Volume2 className="mr-2 h-5 w-5 text-secondary" />
              Listen in {nativeLanguage}
            </Button>
          </motion.div>

          {/* Learning Tips */}
          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
              >
                <TipCard
                  icon={GraduationCap}
                  title="Practice"
                  description="Perfect your pronunciation"
                  color="primary"
                />
                <TipCard
                  icon={BookOpen}
                  title="Context"
                  text="Learn common usage"
                  color="secondary"
                />
                <TipCard
                  icon={MessageCircle}
                  title="Apply"
                  text="Create your sentences"
                  color="accent"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Start Button */}
          <AnimatePresence>
            {isReady && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center"
              >
                <Button
                  onClick={onStart}
                  className="group bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-xl"
                  size="lg"
                >
                  Start Practice
                  <ChevronRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
};

interface TipCardProps {
  icon: React.ElementType;
  title: string;
  text?: string;
  description?: string;
  color: "primary" | "secondary" | "accent";
}

const TipCard: React.FC<TipCardProps> = ({
  icon: Icon,
  title,
  text,
  description,
  color,
}) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`
      flex flex-col items-center p-6 rounded-xl text-center
      bg-${color}/5 border border-${color}/10
      hover:border-${color}/30 transition-all duration-300
    `}
  >
    <Icon className={`w-6 h-6 text-${color} mb-3`} />
    <h3 className="font-medium mb-1">{title}</h3>
    {description && <p className="text-sm text-foreground/70">{description}</p>}
    {text && <p className="text-sm text-foreground/70">{text}</p>}
  </motion.div>
);

export default WordIntroduction;
