// File: components/experience/QuizPart1.tsx

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Headphones } from "lucide-react";

interface QuizPart1Props {
  question: string;
  isReviewMode: boolean;
  onListenQuestion: () => void;
  speaking: boolean;
}

const QuizPart1: React.FC<QuizPart1Props> = ({
  question,
  isReviewMode,
  onListenQuestion,
  speaking,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      {isReviewMode && (
        <div className="mb-4 text-center text-primary font-semibold">
          Review Mode: Mastering Challenging Words
        </div>
      )}
      <h3 className="text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
        {question}
      </h3>
      <div className="flex justify-center mb-6">
        <Button
          onClick={onListenQuestion}
          className="bg-primary/10 hover:bg-primary/20 text-primary text-lg py-2 px-4 rounded-full transition-all duration-300"
          disabled={speaking}
        >
          <Headphones className="mr-2 h-5 w-5" />
          Listen to Question
        </Button>
      </div>
    </motion.div>
  );
};

export default QuizPart1;
