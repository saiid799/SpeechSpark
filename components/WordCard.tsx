// File: components/WordCard.tsx

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, RefreshCw, ChevronRight, Check, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface WordCardProps {
  wordId: string;
  original: string;
  translation: string;
  learned: boolean;
  language: string;
  isLoading?: boolean;
  accuracy?: number;
  practiceCount?: number;
  isJustCompleted?: boolean;
}

const WordCard: React.FC<WordCardProps> = ({
  wordId,
  original,
  translation,
  learned,
  language,
  isLoading = false,
  accuracy = 92,
  practiceCount = 5,
  isJustCompleted = false,
}) => {
  const { speak, speaking } = useSpeechSynthesis();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  // Haptic feedback function
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Short, subtle vibration
    }
  }, []);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    speak(original, language);
  };

  const handleLearnClick = () => {
    triggerHaptic();
    setShowSparkles(true);
    setTimeout(() => setShowSparkles(false), 1000);
    
    // Build contextual URL with navigation information
    const searchParams = new URLSearchParams();
    searchParams.set('from', window.location.pathname + window.location.search);
    
    // Extract current context from URL or page state
    const currentUrl = new URL(window.location.href);
    const batch = currentUrl.searchParams.get('batch');
    const page = currentUrl.searchParams.get('page');
    const level = currentUrl.searchParams.get('level');
    
    if (batch) searchParams.set('batch', batch);
    if (page) searchParams.set('page', page);
    if (level) searchParams.set('level', level);
    if (learned) searchParams.set('review', 'true');
    
    router.push(`/learn/${wordId}?${searchParams.toString()}`);
  };

  const handleCardPress = () => {
    setIsPressed(true);
    triggerHaptic();
    setTimeout(() => setIsPressed(false), 150);
  };


  return (
    <motion.div
      className="group relative cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTapStart={handleCardPress}
      whileHover={{ 
        y: -12, 
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      animate={{
        scale: isPressed ? 0.95 : 1,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Card Container */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl backdrop-blur-lg p-4",
          "border transition-all duration-500 shadow-lg hover:shadow-2xl",
          "min-h-[160px] max-h-[200px] flex flex-col",
          learned
            ? "bg-gradient-to-br from-green-50 via-emerald-50/90 to-green-50/80 hover:from-green-100 hover:via-emerald-50 hover:to-green-50 border-green-300 hover:border-green-400"
            : "bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 hover:from-primary/15 hover:via-secondary/15 hover:to-accent/15 border-primary/20 hover:border-primary/30",
          isLoading && "animate-pulse",
          isJustCompleted && "ring-4 ring-green-400/50 ring-offset-2 ring-offset-background shadow-2xl shadow-green-500/25"
        )}
      >
        {/* Loading Shimmer Overlay */}
        {isLoading && (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: [-100, 100],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "linear"
              }}
              style={{ width: "100px" }}
            />
          </div>
        )}

        {/* Sparkle Effect */}
        <AnimatePresence>
          {showSparkles && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ 
                    scale: 0, 
                    x: Math.random() * 200 + 50, 
                    y: Math.random() * 100 + 50,
                    rotate: 0 
                  }}
                  animate={{ 
                    scale: [0, 1, 0], 
                    rotate: 360,
                    transition: { duration: 0.8, delay: i * 0.1 }
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Enhanced Background Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full blur-3xl",
              learned ? "bg-gradient-to-r from-green-400/20 via-emerald-500/15 to-green-400/20" : "bg-gradient-to-r from-primary/25 via-secondary/20 to-accent/25"
            )}
            animate={{
              scale: [1, 1.3, 1.1, 1],
              opacity: [0.3, 0.6, 0.4, 0.3],
              rotate: [0, 45, -45, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
          <motion.div
            className={cn(
              "absolute inset-4 rounded-2xl blur-xl",
              learned ? "bg-green-300/10" : "bg-primary/15"
            )}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Status Badge - Repositioned and Redesigned */}
        {learned && (
          <motion.div 
            className={cn(
              "absolute top-3 left-3 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold border shadow-sm",
              isJustCompleted 
                ? "bg-gradient-to-r from-yellow-100 to-green-100 text-green-800 border-green-300 animate-pulse" 
                : "bg-green-100 text-green-700 border-green-200"
            )}
            animate={isJustCompleted ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: isJustCompleted ? Infinity : 0, repeatType: "reverse" }}
          >
            <Trophy className={cn("w-3 h-3", isJustCompleted ? "text-yellow-600" : "text-green-600")} />
            <span>{isJustCompleted ? "Just Learned!" : "Learned"}</span>
          </motion.div>
        )}

        {/* Card Content */}
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex justify-between items-start mb-3 flex-1">
            <div className="flex-1 min-w-0 pr-2">
              <motion.h3
                className={cn(
                  "text-xl font-bold mb-2 font-display tracking-tight",
                  "word-card-title line-clamp-2",
                  learned
                    ? "text-green-800"
                    : "text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent"
                )}
                style={{
                  fontFamily: "'DM Sans', 'Inter', sans-serif",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2
                }}
                layout
                title={original}
              >
                {original}
              </motion.h3>
              <motion.p
                className={cn(
                  "text-sm line-clamp-2 word-card-title",
                  learned ? "text-green-700" : "text-foreground/70"
                )}
                layout
                title={translation}
              >
                {translation}
              </motion.p>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex-shrink-0"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSpeak}
                disabled={speaking || isLoading}
                className={cn(
                  "rounded-full p-2 transition-all duration-300 relative overflow-hidden",
                  "hover:shadow-lg active:shadow-sm",
                  learned
                    ? "text-green-700 hover:text-green-800 hover:bg-green-100/80 hover:shadow-green-200/50"
                    : "text-primary hover:text-primary/90 hover:bg-primary/15 hover:shadow-primary/20",
                  speaking && "animate-pulse"
                )}
              >
                <motion.div
                  animate={speaking ? { rotate: [0, 10, -10, 0] } : { rotate: 0 }}
                  transition={{ repeat: speaking ? Infinity : 0, duration: 0.5 }}
                >
                  <Volume2 className={cn("h-4 w-4", speaking && "text-blue-600")} />
                </motion.div>
                
                {/* Sound Wave Animation */}
                {speaking && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-current opacity-30"
                    animate={{
                      scale: [1, 1.5, 2],
                      opacity: [0.3, 0.1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                )}
              </Button>
            </motion.div>
          </div>

          {/* Actions */}
          <motion.div
            className="mt-auto space-y-2"
            initial={false}
            animate={{ height: isHovered ? "auto" : "32px" }}
            transition={{ duration: 0.3 }}
          >
            {/* Enhanced Action Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleLearnClick}
                disabled={isLoading}
                className={cn(
                  "w-full transition-all duration-300 rounded-lg h-8 text-sm font-medium relative overflow-hidden",
                  "flex items-center justify-between group/button",
                  "hover:shadow-lg active:shadow-sm transform-gpu",
                  learned
                    ? "bg-gradient-to-r from-green-100 to-green-50 hover:from-green-200 hover:to-green-100 text-green-700 border border-green-200 hover:border-green-300 hover:shadow-green-200/30"
                    : "bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 text-primary border border-primary/20 hover:border-primary/30 hover:shadow-primary/20",
                  isLoading && "animate-pulse cursor-not-allowed"
                )}
              >
                {/* Background ripple effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover/button:opacity-100"
                  initial={false}
                  animate={{
                    background: learned 
                      ? "radial-gradient(circle at center, rgb(34 197 94 / 0.1) 0%, transparent 70%)"
                      : "radial-gradient(circle at center, rgb(var(--primary) / 0.1) 0%, transparent 70%)"
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                <span className="flex items-center relative z-10">
                  {learned ? (
                    <>
                      <motion.div
                        animate={{ rotate: isHovered ? 360 : 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                      </motion.div>
                      Review Word
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{ x: isHovered ? 4 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                      </motion.div>
                      Learn Word
                    </>
                  )}
                </span>
                
                {learned && (
                  <motion.span 
                    className="rounded-full p-1 bg-green-50 border border-green-200 relative z-10"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </motion.span>
                )}
              </Button>
            </motion.div>

            {/* Enhanced Stats (shown on hover) */}
            <AnimatePresence>
              {isHovered && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-xs font-medium flex justify-between gap-1"
                >
                  <motion.span
                    className={cn(
                      "px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1",
                      "transition-all duration-300 hover:scale-105",
                      learned
                        ? "bg-green-50/80 text-green-700 border border-green-200/60 shadow-sm"
                        : "bg-primary/8 text-foreground/70 border border-primary/15"
                    )}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      accuracy >= 80 ? "bg-green-500" : accuracy >= 60 ? "bg-yellow-500" : "bg-red-500"
                    )} />
                    {accuracy}%
                  </motion.span>
                  
                  <motion.span
                    className={cn(
                      "px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1",
                      "transition-all duration-300 hover:scale-105",
                      learned
                        ? "bg-green-50/80 text-green-700 border border-green-200/60 shadow-sm"
                        : "bg-primary/8 text-foreground/70 border border-primary/15"
                    )}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex">
                      {[...Array(Math.min(practiceCount, 3))].map((_, i) => (
                        <motion.div
                          key={i}
                          className={cn(
                            "w-1 h-1 rounded-full mr-0.5",
                            learned ? "bg-green-500" : "bg-primary"
                          )}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1, duration: 0.2 }}
                        />
                      ))}
                    </div>
                    x{practiceCount}
                  </motion.span>
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
