// File: components/experience/QuizOptionCard.tsx

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Volume2, Check, X } from "lucide-react";

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
  const getBackgroundStyle = () => {
    if (!isSelected) return "bg-card/50 hover:bg-primary/5";
    if (isCorrect) return "bg-green-500/10 border-green-500/50";
    return "bg-red-500/10 border-red-500/50";
  };

  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className="relative group"
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        className={`
          w-full h-auto min-h-[80px] p-4
          rounded-xl border transition-all duration-300
          ${getBackgroundStyle()}
          ${disabled ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}
          backdrop-blur-sm
        `}
      >
        {/* Background Glow Effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={false}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-xl" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between w-full gap-4">
          <span className="text-lg text-left flex-grow">{option}</span>

          <div className="flex items-center gap-2">
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`rounded-full p-1 
                  ${
                    isCorrect
                      ? "bg-green-500/20 text-green-500"
                      : "bg-red-500/20 text-red-500"
                  }`}
              >
                {isCorrect ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
              </motion.div>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onSpeak();
              }}
              disabled={disabled}
              className={`
                opacity-0 group-hover:opacity-100 transition-opacity
                hover:bg-primary/10 hover:text-primary
                ${
                  isSelected &&
                  isCorrect &&
                  "hover:bg-green-500/10 hover:text-green-500"
                }
                ${
                  isSelected &&
                  !isCorrect &&
                  "hover:bg-red-500/10 hover:text-red-500"
                }
              `}
            >
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Indicator for hover state */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/30 transform scale-x-0 origin-left"
          initial={false}
          animate={{ scaleX: isSelected ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </Button>
    </motion.div>
  );
};

export default QuizOptionCard;
