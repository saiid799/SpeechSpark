"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  X,
  Loader2,
  ChevronRight,
  Cpu,
  Layers,
} from "lucide-react";

interface BatchPreparationCompactProps {
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
  generationProgress?: number;
  generationStage?: 'analyzing' | 'generating' | 'finalizing' | 'complete';
}

const BatchPreparationCompact: React.FC<BatchPreparationCompactProps> = ({
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
  generationProgress = 0,
  generationStage = 'analyzing',
}) => {
  const [stage, setStage] = useState<'analyzing' | 'generating' | 'finalizing' | 'complete' | 'failed'>('analyzing');
  const [progress, setProgress] = useState(0);
  
  const progressPercentage = Math.round((currentWords / targetWords) * 100);
  const wordsNeeded = targetWords - currentWords;

  // Enhanced stage management with real progress from parent
  useEffect(() => {
    if (generationError) {
      setStage('failed');
      setProgress(0);
      return;
    }

    if (isGenerating) {
      // Use real progress from parent component
      setStage(generationStage);
      setProgress(generationProgress);
    } else {
      setStage('analyzing');
      setProgress(0);
    }
  }, [isGenerating, generationError, generationProgress, generationStage]);

  useEffect(() => {
    if (currentWords >= targetWords && !generationError) {
      setStage('complete');
      setProgress(100);
    }
  }, [currentWords, targetWords, generationError]);

  const stageConfig = {
    analyzing: {
      icon: Brain,
      title: "Analyzing",
      subtitle: "Scanning vocabulary patterns",
      color: "text-blue-500",
      bgColor: "bg-blue-500",
      gradient: "from-blue-500/20 to-cyan-500/20",
      particle: "bg-blue-400",
    },
    generating: {
      icon: Sparkles,
      title: "Creating",
      subtitle: "Generating new words",
      color: "text-purple-500",
      bgColor: "bg-purple-500",
      gradient: "from-purple-500/20 to-pink-500/20",
      particle: "bg-purple-400",
    },
    finalizing: {
      icon: Layers,
      title: "Finalizing",
      subtitle: "Optimizing your batch",
      color: "text-green-500",
      bgColor: "bg-green-500",
      gradient: "from-green-500/20 to-emerald-500/20",
      particle: "bg-green-400",
    },
    complete: {
      icon: CheckCircle2,
      title: "Ready!",
      subtitle: "Your batch is prepared",
      color: "text-green-500",
      bgColor: "bg-green-500",
      gradient: "from-green-500/20 to-emerald-500/20",
      particle: "bg-green-400",
    },
    failed: {
      icon: AlertTriangle,
      title: "Failed",
      subtitle: "Generation encountered an error",
      color: "text-red-500",
      bgColor: "bg-red-500",
      gradient: "from-red-500/20 to-orange-500/20",
      particle: "bg-red-400",
    },
  };

  const currentStageConfig = stageConfig[stage];
  const StageIcon = currentStageConfig.icon;

  // Floating particles animation
  const particles = Array.from({ length: 8 }, (_, i) => i);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-800/90 backdrop-blur-xl border-0 shadow-2xl shadow-black/20 dark:shadow-black/40">
            {/* Animated background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentStageConfig.gradient} opacity-30`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_70%)]" />
            
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
              {particles.map((particle) => (
                <motion.div
                  key={particle}
                  className={`absolute w-2 h-2 ${currentStageConfig.particle} rounded-full opacity-20`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    x: [0, Math.random() * 10 - 5, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            {/* Header */}
            <div className="relative p-6 pb-4">
              {/* Celebration particles for new batch */}
              {currentWords === 0 && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={`celebration-${i}`}
                      className="absolute w-1 h-1 rounded-full"
                      style={{
                        background: `linear-gradient(45deg, #FFD700, #FFA500, #FF6B6B, #4ECDC4, #45B7D1)`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        scale: [0, 1.5, 0],
                        rotate: [0, 180, 360],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${currentStageConfig.gradient} flex items-center justify-center border border-white/20 dark:border-gray-700/50`}
                    animate={{ 
                      scale: isGenerating ? [1, 1.1, 1] : currentWords === 0 ? [1, 1.2, 1] : 1,
                      rotate: stage === 'generating' ? [0, 360] : 0,
                    }}
                    transition={{ 
                      scale: { duration: 2, repeat: isGenerating || currentWords === 0 ? Infinity : 0 },
                      rotate: { duration: 8, repeat: stage === 'generating' ? Infinity : 0, ease: "linear" },
                    }}
                  >
                    {/* Pulsing ring */}
                    {isGenerating && (
                      <motion.div
                        className={`absolute inset-0 rounded-2xl border-2 border-transparent border-t-${currentStageConfig.bgColor}/60`}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    
                    {/* Celebration ring for new batch */}
                    {currentWords === 0 && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-gradient-to-r from-yellow-400 via-pink-500 to-purple-600"
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 0.3, 0.7],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    
                    {/* Outer glow */}
                    <motion.div
                      className={`absolute inset-0 rounded-2xl ${currentStageConfig.bgColor}/30 blur-md`}
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    <StageIcon className={`w-6 h-6 ${currentStageConfig.color} z-10`} />
                  </motion.div>
                  
                  <div>
                    <motion.h3 
                      className="text-xl font-bold text-gray-900 dark:text-white"
                      animate={currentWords === 0 ? { 
                        scale: [1, 1.05, 1],
                        color: ["#1f2937", "#f59e0b", "#1f2937"]
                      } : {}}
                      transition={{ duration: 2, repeat: currentWords === 0 ? Infinity : 0 }}
                    >
                      {currentWords === 0 ? "🎉 New Batch" : `Batch ${batchNumber}`}
                    </motion.h3>
                    <motion.div
                      key={stage}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className={`text-sm font-medium ${currentStageConfig.color}`}>
                        {currentWords === 0 ? "Congratulations on completing 50 words!" : currentStageConfig.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {currentWords === 0 ? "Preparing your next learning adventure" : currentStageConfig.subtitle}
                      </p>
                    </motion.div>
                  </div>
                </div>
                
                {onCancel && !isGenerating && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Progress section */}
            <div className="relative px-6 pb-6">
              {/* Words progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Words Progress
                  </span>
                  <motion.span 
                    className="text-sm font-bold text-gray-900 dark:text-white"
                    key={currentWords}
                    initial={{ scale: 1.3, color: currentStageConfig.color }}
                    animate={{ scale: 1, color: "inherit" }}
                    transition={{ duration: 0.4 }}
                  >
                    {currentWords}/{targetWords}
                  </motion.span>
                </div>
                
                <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${currentStageConfig.gradient} rounded-full relative`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    {/* Progress shimmer */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
                      animate={{ x: [-100, 300] }}
                      transition={{ 
                        duration: 2, 
                        repeat: progressPercentage < 100 ? Infinity : 0,
                        ease: "easeInOut"
                      }}
                      style={{ width: "100px" }}
                    />
                  </motion.div>
                  
                  {/* Progress dot */}
                  {progressPercentage > 0 && progressPercentage < 100 && (
                    <motion.div
                      className={`absolute -top-1 w-5 h-5 ${currentStageConfig.bgColor} rounded-full border-3 border-white dark:border-gray-900 shadow-lg`}
                      style={{ left: `calc(${progressPercentage}% - 10px)` }}
                      animate={{ 
                        scale: [1, 1.3, 1],
                        boxShadow: [
                          '0 0 0 0 rgba(0,0,0,0.1)',
                          '0 0 0 8px rgba(0,0,0,0.05)',
                          '0 0 0 0 rgba(0,0,0,0.1)'
                        ]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Generation progress */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-800/80 dark:to-gray-700/80 rounded-xl border border-gray-200/50 dark:border-gray-600/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      AI Generation
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {progress}%
                    </span>
                  </div>
                  
                  <div className="relative mb-3">
                    <Progress value={progress} className="h-2 bg-gray-200 dark:bg-gray-700" />
                    <motion.div
                      className="absolute top-0 left-0 h-2 bg-gradient-to-r from-white/60 to-transparent rounded-full"
                      animate={{ x: [-30, 150] }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                      style={{ width: "30px" }}
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Cpu className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </motion.div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {stage === 'analyzing' && `Analyzing ${language} vocabulary patterns`}
                      {stage === 'generating' && `Creating ${wordsNeeded} new words for ${level}`}
                      {stage === 'finalizing' && "Optimizing word selection and quality assurance"}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Enhanced Error state */}
              {generationError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border border-red-200 dark:border-red-800/50 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: 2 }}
                    >
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                        Generation Failed
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-500 mt-1 leading-relaxed">
                        {generationError}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                {currentWords < targetWords && !isGenerating && (
                  <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={onGenerateWords}
                      size="lg"
                      className={`w-full h-12 font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl border-0 ${
                        currentWords === 0 
                          ? "bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700 text-white shadow-yellow-500/25 hover:shadow-yellow-500/40" 
                          : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-primary/25 hover:shadow-primary/40"
                      }`}
                    >
                      <motion.div
                        animate={{ 
                          scale: currentWords === 0 ? [1, 1.2, 1] : [1, 1.1, 1],
                          rotate: currentWords === 0 ? [0, 10, -10, 0] : 0,
                        }}
                        transition={{ 
                          duration: currentWords === 0 ? 1.5 : 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {currentWords === 0 ? (
                          <Sparkles className="w-5 h-5 mr-2" />
                        ) : (
                          <Zap className="w-5 h-5 mr-2" />
                        )}
                      </motion.div>
                      {currentWords === 0 ? "🚀 Start New Adventure" : `Generate ${wordsNeeded} Words`}
                      {currentWords === 0 && (
                        <motion.span
                          className="ml-2"
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          ✨
                        </motion.span>
                      )}
                    </Button>
                  </motion.div>
                )}
                
                {isGenerating && (
                  <Button
                    disabled
                    size="lg"
                    className="flex-1 h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-300 font-semibold rounded-xl cursor-not-allowed"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-5 h-5 mr-2" />
                    </motion.div>
                    Generating...
                  </Button>
                )}
                
                {stage === 'complete' && (
                  <motion.div 
                    className="flex-1" 
                    whileTap={{ scale: 0.98 }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                  >
                    <Button
                      onClick={onCancel}
                      size="lg"
                      className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-green-500/40 border-0"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Start Learning
                      <motion.div
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </motion.div>
                    </Button>
                  </motion.div>
                )}

                {stage === 'failed' && (
                  <motion.div 
                    className="flex-1" 
                    whileTap={{ scale: 0.98 }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                  >
                    <Button
                      onClick={onGenerateWords}
                      size="lg"
                      className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-red-500/40 border-0"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Try Again
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Stats footer */}
              <motion.div 
                className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-center">
                  <motion.p 
                    className="text-lg font-bold text-gray-900 dark:text-white"
                    key={progressPercentage}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {progressPercentage}%
                  </motion.p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Complete
                  </p>
                </div>
                
                <div className="text-center px-4">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[80px]">
                    {level}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Level
                  </p>
                </div>
                
                <div className="text-center">
                  <motion.p 
                    className="text-lg font-bold text-gray-900 dark:text-white"
                    key={wordsNeeded}
                    initial={{ scale: 1.2, color: currentStageConfig.color }}
                    animate={{ scale: 1, color: "inherit" }}
                    transition={{ duration: 0.3 }}
                  >
                    {wordsNeeded}
                  </motion.p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Needed
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Animated border effects */}
            {isGenerating && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: `conic-gradient(from 0deg, transparent, ${currentStageConfig.bgColor}/20, transparent)`,
                  padding: "1px",
                  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  maskComposite: "subtract",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
            )}
            
            {/* Success glow */}
            {stage === 'complete' && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${currentStageConfig.bgColor}/15, transparent 70%)`,
                }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {/* Failure shake effect */}
            {stage === 'failed' && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none border-2 border-red-500/30"
                animate={{ 
                  scale: [1, 1.02, 1],
                  opacity: [0.3, 0.6, 0.3] 
                }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              />
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BatchPreparationCompact;