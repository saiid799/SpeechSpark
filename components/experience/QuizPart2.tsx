// File: components/experience/QuizPart2.tsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuizOptionCard from "./QuizOptionCard";

interface QuizPart2Props {
  options: string[];
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  onAnswer: (option: string) => void;
  onSpeakOption: (option: string) => void;
  speaking: boolean;
}

const QuizPart2: React.FC<QuizPart2Props> = ({
  options,
  selectedAnswer,
  isCorrect,
  onAnswer,
  onSpeakOption,
  speaking,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <AnimatePresence mode="wait">
        {options.map((option, index) => (
          <motion.div
            key={option}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <QuizOptionCard
              option={option}
              isSelected={selectedAnswer === option}
              isCorrect={selectedAnswer === option ? isCorrect : null}
              onClick={() => onAnswer(option)}
              onSpeak={() => onSpeakOption(option)}
              disabled={selectedAnswer !== null || speaking}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default QuizPart2;
