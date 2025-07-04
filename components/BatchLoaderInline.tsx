"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Sparkles,
  CheckCircle2,
  Zap,
  Loader2,
} from "lucide-react";

interface BatchLoaderInlineProps {
  currentWords: number;
  targetWords: number;
  batchNumber: number;
  isGenerating?: boolean;
  onGenerate?: () => void;
  className?: string;
}

const BatchLoaderInline: React.FC<BatchLoaderInlineProps> = ({
  currentWords,
  targetWords,
  batchNumber,
  isGenerating = false,
  onGenerate,
  className = "",
}) => {
  const progressPercentage = Math.round((currentWords / targetWords) * 100);
  const wordsNeeded = targetWords - currentWords;
  const isComplete = currentWords >= targetWords;

  const getStageConfig = () => {
    if (isComplete) {
      return {
        icon: CheckCircle2,
        color: "text-green-500",
        bgColor: "bg-green-500",
        message: "Batch Ready!",
      };
    } else if (isGenerating) {
      return {
        icon: Sparkles,
        color: "text-purple-500",
        bgColor: "bg-purple-500",
        message: "Generating...",
      };
    } else {
      return {
        icon: Brain,
        color: "text-blue-500",
        bgColor: "bg-blue-500",
        message: "Preparing Batch",
      };
    }
  };

  const stageConfig = getStageConfig();
  const StageIcon = stageConfig.icon;

  return (
    <Card className={`p-4 bg-gradient-to-r from-background to-background/95 border border-foreground/10 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Icon with animated ring */}
        <div className="relative">
          <motion.div
            className={`w-12 h-12 rounded-full ${stageConfig.bgColor}/10 flex items-center justify-center border border-${stageConfig.bgColor}/20`}
            animate={{ 
              scale: isGenerating ? [1, 1.05, 1] : 1,
            }}
            transition={{ 
              duration: 2, 
              repeat: isGenerating ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            {isGenerating && (
              <motion.div
                className={`absolute inset-0 rounded-full border-2 border-transparent border-t-${stageConfig.bgColor}/50`}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}
            <StageIcon className={`w-5 h-5 ${stageConfig.color}`} />
          </motion.div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-sm text-foreground">
                Batch {batchNumber}
              </h4>
              <p className="text-xs text-muted-foreground">
                {stageConfig.message}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {currentWords}/{targetWords}
              </p>
              <p className="text-xs text-muted-foreground">
                words
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative mb-3">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${stageConfig.bgColor} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            
            {/* Shimmer effect */}
            {progressPercentage < 100 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                animate={{ x: [-100, 200] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ width: "50px" }}
              />
            )}
          </div>

          {/* Action button */}
          {!isComplete && onGenerate && (
            <Button
              onClick={onGenerate}
              disabled={isGenerating}
              size="sm"
              className="w-full h-8 text-xs"
              variant={isGenerating ? "secondary" : "default"}
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-3 h-3 mr-2" />
                  </motion.div>
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 mr-2" />
                  {currentWords === 0 ? "Generate Batch" : `Add ${wordsNeeded} Words`}
                </>
              )}
            </Button>
          )}

          {isComplete && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Batch Complete</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BatchLoaderInline;