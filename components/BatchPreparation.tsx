"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Sparkles,
  Globe,
  BookOpen,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lightbulb,
} from "lucide-react";

interface BatchPreparationProps {
  isVisible: boolean;
  currentWords: number;
  targetWords: number;
  batchNumber: number;
  onGenerateWords: () => Promise<void>;
  onCancel?: () => void;
  isGenerating?: boolean;
  generationError?: string | null;
  language?: string;
  level?: string;
}

const BatchPreparation: React.FC<BatchPreparationProps> = ({
  isVisible,
  currentWords,
  targetWords,
  batchNumber,
  onGenerateWords,
  onCancel,
  isGenerating = false,
  generationError = null,
  language = "your target language",
  level = "current level",
}) => {
  const [stage, setStage] = useState<'analyzing' | 'generating' | 'finalizing' | 'complete'>('analyzing');
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(30);
  
  const progressPercentage = Math.round((currentWords / targetWords) * 100);
  const wordsNeeded = targetWords - currentWords;

  useEffect(() => {
    if (isGenerating) {
      // Simulate generation stages for better UX
      setStage('analyzing');
      setProgress(0);
      
      const timer1 = setTimeout(() => {
        setStage('generating');
        setProgress(25);
        setEstimatedTime(20);
      }, 2000);
      
      const timer2 = setTimeout(() => {
        setProgress(65);
        setEstimatedTime(10);
      }, 8000);
      
      const timer3 = setTimeout(() => {
        setStage('finalizing');
        setProgress(85);
        setEstimatedTime(5);
      }, 15000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setStage('analyzing');
      setProgress(0);
      setEstimatedTime(30);
    }
  }, [isGenerating]);

  useEffect(() => {
    if (currentWords >= targetWords) {
      setStage('complete');
      setProgress(100);
    }
  }, [currentWords, targetWords]);

  const stageConfig = {
    analyzing: {
      icon: Brain,
      title: "Analyzing Your Learning Journey",
      description: "Assessing your progress and preparing personalized vocabulary",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    generating: {
      icon: Sparkles,
      title: "Crafting Your Vocabulary",
      description: "AI is creating culturally relevant, modern vocabulary for your level",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    finalizing: {
      icon: CheckCircle2,
      title: "Finalizing Your Batch",
      description: "Ensuring quality and removing duplicates from your word collection",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    complete: {
      icon: CheckCircle2,
      title: "Batch Ready!",
      description: "Your complete vocabulary batch is ready for learning",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  };

  const isActiveStage = (currentStage: string, targetStage: string) => currentStage === targetStage;
  const isCompleteStage = (currentStage: string) => currentStage === 'finalizing' || currentStage === 'complete';

  const currentStageConfig = stageConfig[stage];
  const StageIcon = currentStageConfig.icon;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <Card className="p-8 bg-gradient-to-br from-background via-background to-background/95 border-2 border-foreground/10 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className={`mx-auto w-20 h-20 ${currentStageConfig.bgColor} rounded-full flex items-center justify-center mb-4`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <StageIcon className={`w-10 h-10 ${currentStageConfig.color}`} />
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-2">
                Preparing Batch {batchNumber}
              </h2>
              <p className="text-muted-foreground">
                Building your complete {language} vocabulary collection
              </p>
            </div>

            {/* Progress Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">
                  Batch Completion
                </span>
                <span className="text-sm text-muted-foreground">
                  {currentWords} / {targetWords} words
                </span>
              </div>
              
              <Progress value={progressPercentage} className="h-3 mb-2" />
              
              <div className="text-xs text-muted-foreground text-center">
                {progressPercentage}% complete • {wordsNeeded} words needed
              </div>
            </div>

            {/* Stage Information */}
            <motion.div
              key={stage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${currentStageConfig.bgColor} rounded-xl p-6 mb-8`}
            >
              <div className="flex items-start gap-4">
                <div className={`${currentStageConfig.bgColor} rounded-lg p-3`}>
                  <StageIcon className={`w-6 h-6 ${currentStageConfig.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">
                    {currentStageConfig.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {currentStageConfig.description}
                  </p>
                  
                  {isGenerating && stage !== 'complete' && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Estimated time: {estimatedTime}s</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Generation Progress */}
            {isGenerating && stage !== 'complete' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Generation Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {progress}%
                  </span>
                </div>
                
                <Progress value={progress} className="h-2 mb-2" />
                
                <div className="grid grid-cols-3 gap-4 mt-4 text-xs">
                  <div className={`text-center p-2 rounded-lg ${isActiveStage(stage, 'analyzing') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                    <Brain className="w-4 h-4 mx-auto mb-1" />
                    Analyzing
                  </div>
                  <div className={`text-center p-2 rounded-lg ${isActiveStage(stage, 'generating') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                    <Sparkles className="w-4 h-4 mx-auto mb-1" />
                    Generating
                  </div>
                  <div className={`text-center p-2 rounded-lg ${isCompleteStage(stage) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                    Finalizing
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {generationError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-700 mb-1">
                      Generation Error
                    </h4>
                    <p className="text-sm text-red-600">{generationError}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Learning Tip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 mb-8"
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-700 mb-1">
                    Pro Tip
                  </h4>
                  <p className="text-sm text-amber-600">
                    We ensure every batch has exactly 50 words for optimal learning. 
                    This maintains consistent progress tracking and prevents cognitive overload.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {currentWords < targetWords && !isGenerating && (
                <Button
                  onClick={onGenerateWords}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  size="lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {currentWords === 0 ? "Generate Batch" : "Complete Batch"}
                </Button>
              )}
              
              {isGenerating && (
                <Button
                  disabled
                  className="flex-1"
                  size="lg"
                  variant="outline"
                >
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Generating Words...
                </Button>
              )}
              
              {stage === 'complete' && (
                <Button
                  onClick={onCancel}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  size="lg"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Continue Learning
                </Button>
              )}
              
              {onCancel && !isGenerating && stage !== 'complete' && (
                <Button
                  onClick={onCancel}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Cancel
                </Button>
              )}
            </div>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-8 pt-6 border-t border-foreground/10"
            >
              <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Culturally Relevant</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Level Appropriate</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Powered</span>
                </div>
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BatchPreparation;