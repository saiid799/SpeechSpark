import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, ArrowRight, X } from "lucide-react";
import { LEVEL_DETAILS, WORDS_PER_LEVEL, ProficiencyLevel } from "@/lib/level-config";

interface LevelProgressModalProps {
  show: boolean;
  currentLevel: string;
  nextLevel: string;
  learnedWords: number;
  onConfirm: () => void;
  onClose: () => void;
}

const LevelProgressModal: React.FC<LevelProgressModalProps> = ({
  show,
  currentLevel,
  nextLevel,
  learnedWords,
  onConfirm,
  onClose,
}) => {
  const currentLevelDetails = LEVEL_DETAILS[currentLevel as ProficiencyLevel];
  const nextLevelDetails = LEVEL_DETAILS[nextLevel as ProficiencyLevel];

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/20">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <motion.div
                  className="p-2 bg-gradient-to-r from-primary to-secondary rounded-full"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <Trophy className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Level Complete!</h2>
                  <p className="text-sm text-muted-foreground">Ready to advance?</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Summary */}
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-3xl font-bold text-primary mb-1">
                    {learnedWords.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    words mastered in {currentLevel}
                  </div>
                </motion.div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0</span>
                  <span>{WORDS_PER_LEVEL.toLocaleString()} words</span>
                </div>
              </div>
            </div>

            {/* Level Transition */}
            <div className="mb-6">
              <div className="flex items-center justify-between py-4 px-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground mb-1">
                    {currentLevel}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentLevelDetails.name}
                  </div>
                </div>
                
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6 text-primary" />
                </motion.div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-primary mb-1">
                    {nextLevel}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {nextLevelDetails.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Preview */}
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 rounded-lg border border-yellow-200/50">
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Star className="w-5 h-5 text-yellow-500 mt-0.5" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">
                    Achievement Unlocked
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {nextLevelDetails.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Stay at {currentLevel}
              </Button>
              <Button
                onClick={onConfirm}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                Advance to {nextLevel}
              </Button>
            </div>

            {/* Footer Note */}
            <p className="text-xs text-center text-muted-foreground mt-4">
              You can always return to practice previous levels
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LevelProgressModal;