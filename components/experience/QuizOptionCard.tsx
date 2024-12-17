// File: components/experience/QuizOptionCard.tsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Volume2, Check, X, Sparkles } from "lucide-react";

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
  const getStyles = () => {
    if (!isSelected) {
      return {
        background: "bg-card/30",
        border: "border-foreground/10",
        hover: "hover:border-primary/30 hover:bg-primary/5",
        icon: "text-primary",
        glow: "from-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:to-transparent",
      };
    }

    if (isCorrect) {
      return {
        background: "bg-green-500/5",
        border: "border-green-500/30",
        hover: "hover:border-green-500/50 hover:bg-green-500/10",
        icon: "text-green-500",
        glow: "from-green-500/20 to-transparent",
      };
    }

    return {
      background: "bg-red-500/5",
      border: "border-red-500/30",
      hover: "hover:border-red-500/50 hover:bg-red-500/10",
      icon: "text-red-500",
      glow: "from-red-500/20 to-transparent",
    };
  };

  const styles = getStyles();

  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className="relative group"
    >
      {/* Background Glow Effect */}
      <motion.div
        className={`absolute -inset-0.5 bg-gradient-to-r ${styles.glow} opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500`}
      />

      <motion.div
        className={`
          relative overflow-hidden rounded-xl border backdrop-blur-sm
          transition-all duration-300 cursor-pointer
          ${styles.background} ${styles.border} ${!disabled && styles.hover}
          ${disabled ? "opacity-75 cursor-not-allowed" : ""}
        `}
        onClick={disabled ? undefined : onClick}
      >
        {/* Side Highlight Effect */}
        <motion.div
          className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-transparent via-white/20 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isSelected ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Content Container */}
        <div className="relative p-5 flex items-center justify-between gap-4">
          {/* Left Side Content */}
          <div className="flex items-center gap-4 flex-grow">
            {/* Selection Circle */}
            <div
              className={`
              relative w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-colors duration-300 overflow-hidden
              ${
                isSelected
                  ? isCorrect
                    ? "border-green-500"
                    : "border-red-500"
                  : "border-foreground/20 group-hover:border-primary/50"
              }
            `}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className={`absolute inset-0.5 rounded-full ${
                      isCorrect ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    <motion.div
                      className="absolute inset-0 opacity-50"
                      animate={{
                        backgroundPosition: ["0% 0%", "100% 100%"],
                        backgroundImage: [
                          "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.2) 0%, transparent 50%)",
                          "radial-gradient(circle at 100% 100%, rgba(255,255,255,0.2) 0%, transparent 50%)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Option Text */}
            <span className="text-lg font-medium text-foreground/90">
              {option}
            </span>
          </div>

          {/* Right Side Elements */}
          <div className="flex items-center gap-3">
            {/* Result Icon with Animation */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className={`
                    relative rounded-full p-2 overflow-hidden
                    ${isCorrect ? "bg-green-500/10" : "bg-red-500/10"}
                  `}
                >
                  {isCorrect ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <motion.div
                        className="absolute inset-0 bg-green-500/20"
                        animate={{
                          scale: [1, 1.5],
                          opacity: [0.5, 0],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                      />
                    </>
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Listen Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onSpeak();
              }}
              disabled={disabled}
              className={`
                opacity-0 group-hover:opacity-100 
                transition-all duration-300
                hover:bg-foreground/5 relative
                ${styles.icon}
              `}
            >
              <Volume2 className="w-4 h-4" />
              <motion.div
                className="absolute inset-0 bg-foreground/5 rounded-md"
                initial={false}
                whileHover={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </Button>

            {/* Hover Sparkles */}
            <AnimatePresence>
              {!isSelected && !disabled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute right-3"
                >
                  <Sparkles className="w-4 h-4 text-primary/30" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Progress Line */}
        {isSelected && (
          <motion.div
            className={`
              absolute bottom-0 left-0 right-0 h-0.5
              ${isCorrect ? "bg-green-500" : "bg-red-500"}
            `}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default QuizOptionCard;
