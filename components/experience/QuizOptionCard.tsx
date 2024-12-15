// File: components/experience/QuizOptionCard.tsx

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

interface QuizOptionCardProps {
  option: string;
  isSelected: boolean;
  isCorrect: boolean | null;
  onClick: () => void;
  onSpeak: () => void;
  disabled: boolean;
}

const QuizOptionCard: React.FC<QuizOptionCardProps> = ({
  option,
  isSelected,
  isCorrect,
  onClick,
  onSpeak,
  disabled,
}) => {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className="w-full"
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        className={`
          w-full h-auto py-4 px-6 text-lg rounded-xl transition-all duration-300
          flex flex-col items-center justify-center space-y-2
          ${
            isSelected
              ? isCorrect
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
              : "bg-card hover:bg-primary/10 text-foreground"
          }
          ${disabled ? "opacity-75 cursor-not-allowed" : ""}
        `}
      >
        <span className="text-center break-words">{option}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onSpeak();
          }}
          disabled={disabled}
          className="mt-2 opacity-75 hover:opacity-100 transition-opacity"
        >
          <Volume2 className="h-4 w-4 mr-1" />
          Listen
        </Button>
      </Button>
    </motion.div>
  );
};

export default QuizOptionCard;
