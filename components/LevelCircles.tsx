// File: components/LevelCircles.tsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import LevelDetailsModal from "@/components/LevelDetailsModal";

interface LevelCirclesProps {
  currentLevel: string;
  completedLevels: string[];
  onLevelClick: (level: string) => void;
}

const levels = ["A1", "A2", "B1", "B2", "C1"];

const LevelCircles: React.FC<LevelCirclesProps> = ({
  currentLevel,
  completedLevels,
  onLevelClick,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const handleLevelClick = (level: string) => {
    if (completedLevels.includes(level) || level === currentLevel) {
      setSelectedLevel(level);
    } else {
      onLevelClick(level);
    }
  };

  return (
    <>
      <div className="flex justify-center space-x-6 mt-12">
        {levels.map((level) => {
          const isCompleted = completedLevels.includes(level);
          const isCurrent = level === currentLevel;
          const isAccessible =
            isCompleted ||
            isCurrent ||
            completedLevels.length >= levels.indexOf(level);

          return (
            <TooltipProvider key={level}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: isAccessible ? 1.1 : 1 }}
                    whileTap={{ scale: isAccessible ? 0.9 : 1 }}
                    onClick={() => handleLevelClick(level)}
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold cursor-pointer
                      transition-all duration-300 shadow-lg
                      ${
                        isAccessible
                          ? "hover:shadow-xl"
                          : "cursor-not-allowed opacity-50"
                      }
                      ${isCompleted ? "bg-green-500 text-white" : ""}
                      ${
                        isCurrent
                          ? "bg-primary text-white ring-4 ring-primary/30"
                          : ""
                      }
                      ${
                        !isCompleted && !isCurrent
                          ? "bg-background border-2 border-primary/30 text-primary"
                          : ""
                      }
                    `}
                  >
                    {level}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isAccessible
                      ? `View ${level} words`
                      : `Complete previous levels to unlock ${level}`}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      {selectedLevel && (
        <LevelDetailsModal
          level={selectedLevel}
          isOpen={!!selectedLevel}
          onClose={() => setSelectedLevel(null)}
        />
      )}
    </>
  );
};

export default LevelCircles;
