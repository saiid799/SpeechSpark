// File: components/WordCard.tsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, RefreshCw, ChevronRight, Check, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface WordCardProps {
  wordIndex: number;
  original: string;
  translation: string;
  learned: boolean;
  language: string;
}

const WordCard: React.FC<WordCardProps> = ({
  wordIndex,
  original,
  translation,
  learned,
  language,
}) => {
  const { speak, speaking } = useSpeechSynthesis();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(original, language);
  };

  const handleLearnClick = () => {
    router.push(`/learn/${wordIndex}${learned ? "?review=true" : ""}`);
  };

  return (
    <motion.div
      className="group relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Card Container */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl backdrop-blur-lg p-6",
          "border transition-all duration-500 shadow-lg hover:shadow-2xl",
          learned
            ? "bg-gradient-to-br from-green-50 via-emerald-50/90 to-green-50/80 hover:from-green-100 hover:via-emerald-50 hover:to-green-50 border-green-300 hover:border-green-400"
            : "bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 hover:from-primary/15 hover:via-secondary/15 hover:to-accent/15 border-primary/20 hover:border-primary/30"
        )}
      >
        {/* Background Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full blur-2xl",
              learned ? "bg-green-500/10" : "bg-primary/20"
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </div>

        {/* Status Badge - Repositioned and Redesigned */}
        {learned && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-green-100 rounded-full px-3 py-1 text-sm font-semibold text-green-700 border border-green-200 shadow-sm">
            <Trophy className="w-4 h-4 text-green-600" />
            <span>Learned</span>
          </div>
        )}

        {/* Card Content */}
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 mt-8">
              <motion.h3
                className={cn(
                  "text-2xl font-bold mb-3",
                  learned
                    ? "text-green-800"
                    : "text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent"
                )}
                layout
              >
                {original}
              </motion.h3>
              <motion.p
                className={cn(
                  "text-lg",
                  learned ? "text-green-700" : "text-foreground/70"
                )}
                layout
              >
                {translation}
              </motion.p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSpeak}
              disabled={speaking}
              className={cn(
                "rounded-full p-2 transition-all duration-300 mt-8",
                learned
                  ? "text-green-700 hover:text-green-800 hover:bg-green-100"
                  : "text-primary hover:text-primary/90 hover:bg-primary/10"
              )}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Actions */}
          <motion.div
            className="mt-4 space-y-3"
            initial={false}
            animate={{ height: isHovered ? "auto" : "40px" }}
            transition={{ duration: 0.3 }}
          >
            {/* Action Button */}
            <Button
              onClick={handleLearnClick}
              className={cn(
                "w-full transition-all duration-300 rounded-xl h-12 text-base font-medium",
                "flex items-center justify-between",
                learned
                  ? "bg-green-100 hover:bg-green-200 text-green-700 border-green-200"
                  : "bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
              )}
            >
              <span className="flex items-center">
                {learned ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Review Word
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-5 w-5 mr-2" />
                    Learn Word
                  </>
                )}
              </span>
              {learned && (
                <span className="rounded-full p-1.5 bg-green-50 border border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                </span>
              )}
            </Button>

            {/* Stats (shown on hover) */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm font-medium flex justify-between"
                >
                  <span
                    className={cn(
                      "px-3 py-1.5 rounded-md",
                      learned
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-primary/5 text-foreground/60"
                    )}
                  >
                    Accuracy: 92%
                  </span>
                  <span
                    className={cn(
                      "px-3 py-1.5 rounded-md",
                      learned
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-primary/5 text-foreground/60"
                    )}
                  >
                    Practice count: 5
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default WordCard;
