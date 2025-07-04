"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Trophy, Sparkles, Star, Zap } from "lucide-react";

interface BatchCompletionCelebrationProps {
  show: boolean;
  batchNumber: number;
  wordsCompleted: number;
  onComplete?: () => void;
}

const BatchCompletionCelebration: React.FC<BatchCompletionCelebrationProps> = ({
  show,
  batchNumber,
  wordsCompleted,
  onComplete,
}) => {
  // Auto-hide after animation
  React.useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  // Celebration particles
  const particles = Array.from({ length: 20 }, (_, i) => i);
  const confetti = Array.from({ length: 15 }, (_, i) => i);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        {/* Celebration particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: `linear-gradient(45deg, #FFD700, #FFA500, #FF6B6B, #4ECDC4, #45B7D1)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, -200],
                x: [0, Math.random() * 100 - 50],
                scale: [0, 1, 0],
                rotate: [0, 360],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                ease: "easeOut",
              }}
            />
          ))}
          
          {/* Confetti */}
          {confetti.map((piece) => (
            <motion.div
              key={`confetti-${piece}`}
              className="absolute w-2 h-4 rounded-sm"
              style={{
                background: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#9B59B6"][piece % 5],
                left: `${Math.random() * 100}%`,
                top: "-10%",
              }}
              animate={{
                y: [0, window.innerHeight + 100],
                x: [0, Math.random() * 200 - 100],
                rotate: [0, 360 * 3],
                opacity: [1, 0.8, 0],
              }}
              transition={{
                duration: 4,
                delay: Math.random() * 1.5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Main celebration card */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ 
            type: "spring", 
            duration: 0.6, 
            bounce: 0.4,
            delay: 0.2 
          }}
          className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-pink-500/20 to-purple-600/20 rounded-3xl" />
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400/30 to-pink-500/30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10">
            {/* Trophy icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring", 
                duration: 0.8, 
                bounce: 0.6, 
                delay: 0.5 
              }}
              className="mx-auto w-20 h-20 mb-6 relative"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              
              {/* Sparkles around trophy */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2"
                  style={{
                    left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 35}px`,
                    top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 35}px`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  <Star className="w-2 h-2 text-yellow-400 fill-current" />
                </motion.div>
              ))}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent"
            >
              Batch Complete! 🎉
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-lg text-gray-600 dark:text-gray-400 mb-6"
            >
              Amazing! You&apos;ve mastered <span className="font-bold text-green-600">{wordsCompleted}</span> words in Batch {batchNumber}
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, type: "spring", bounce: 0.4 }}
              className="flex justify-center gap-8 mb-6"
            >
              <div className="text-center">
                <motion.div 
                  className="text-2xl font-bold text-green-600"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {wordsCompleted}
                </motion.div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Words Learned</div>
              </div>
              <div className="text-center">
                <motion.div 
                  className="text-2xl font-bold text-blue-600"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  {batchNumber}
                </motion.div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Batch Completed</div>
              </div>
            </motion.div>

            {/* Achievement badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="flex justify-center gap-4 mb-6"
            >
              <motion.div
                className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
              </motion.div>
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-3"
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-5 h-5 text-white" />
              </motion.div>
            </motion.div>

            {/* Encouragement message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-gray-600 dark:text-gray-400 text-sm"
            >
              Ready for your next learning adventure? Let&apos;s generate 50 new words! 🚀
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BatchCompletionCelebration;