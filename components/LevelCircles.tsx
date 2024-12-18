// File: components/LevelCircles.tsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { allProficiencyLevels } from "@/lib/languageData";
import LevelDetailsModal from "@/components/LevelDetailsModal";

interface LevelCirclesProps {
  currentLevel: string;
  completedLevels: string[];
  onLevelClick: (level: string) => void;
}

const LevelCircles: React.FC<LevelCirclesProps> = ({
  currentLevel,
  completedLevels,
  onLevelClick,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const handleLevelClick = (level: string) => {
    const isBasicLevel = level === "A1" || level === "A2";
    const isUnlocked =
      completedLevels.includes(level) || level === currentLevel;

    if (isBasicLevel || isUnlocked) {
      setSelectedLevel(level);
    } else {
      onLevelClick(level);
    }
  };

  return (
    <>
      <div className="flex justify-center space-x-6 mt-12">
        {allProficiencyLevels.map((level) => {
          const isCompleted = completedLevels.includes(level.value);
          const isCurrent = level.value === currentLevel;
          const isAccessible =
            level.value === "A1" ||
            level.value === "A2" ||
            isCompleted ||
            isCurrent;
          const isLocked = !isAccessible;

          return (
            <TooltipProvider key={level.value}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: isAccessible ? 1.1 : 1 }}
                    whileTap={{ scale: isAccessible ? 0.9 : 1 }}
                    onClick={() => handleLevelClick(level.value)}
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold
                      transition-all duration-300 shadow-lg relative
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
                        !isCompleted && !isCurrent && !isLocked
                          ? "bg-background border-2 border-primary/30 text-primary"
                          : ""
                      }
                      ${isLocked ? "bg-gray-200 border-gray-300" : ""}
                    `}
                  >
                    {level.value}
                    {isLocked && (
                      <div className="absolute inset-0 bg-background/50 rounded-full flex items-center justify-center">
                        <Lock className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    {isLocked
                      ? `Complete ${
                          level.value === "B1"
                            ? "A2"
                            : `${level.value.charAt(0)}${
                                parseInt(level.value.charAt(1)) - 1
                              }`
                        } to unlock`
                      : `${level.label} - ${
                          isCompleted ? "Completed" : "Current Level"
                        }`}
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
