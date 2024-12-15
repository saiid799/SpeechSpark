// File: components/experience/Pronunciation.tsx

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, Volume2 } from "lucide-react";

interface PronunciationProps {
  word: string;
  pronunciation: string;
  nativeLanguage: string;
  learningLanguage: string;
  onSpeak: (text: string, language: string) => void;
  speaking: boolean;
}

const Pronunciation: React.FC<PronunciationProps> = ({
  word,
  pronunciation,
  nativeLanguage,
  learningLanguage,
  onSpeak,
  speaking,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-4 p-4 bg-secondary/10 rounded-lg"
    >
      <div className="flex flex-col items-center space-y-2">
        <p className="text-xl font-semibold text-secondary">{word}</p>
        <p className="text-center text-secondary">
          Pronunciation (in {nativeLanguage}): {pronunciation}
        </p>
        <div className="flex space-x-2">
          <Button
            onClick={() => onSpeak(word, learningLanguage)}
            className="bg-primary/10 hover:bg-primary/20 text-primary"
            disabled={speaking}
          >
            <Volume2 className="mr-2 h-4 w-4" />
            Listen in {learningLanguage}
          </Button>
          <Button
            onClick={() => onSpeak(pronunciation, nativeLanguage)}
            className="bg-secondary/10 hover:bg-secondary/20 text-secondary"
            disabled={speaking}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Pronunciation Guide
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Pronunciation;
