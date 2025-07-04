import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { 
  Trophy, 
  Flame, 
  Target, 
  Calendar,
  Sparkles,
  Star,
  Medal,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface EnhancedStreakCardProps {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
  className?: string;
}

const EnhancedStreakCard: React.FC<EnhancedStreakCardProps> = ({
  currentStreak,
  longestStreak,
  todayCompleted,
  className
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [previousStreak, setPreviousStreak] = useState(currentStreak);

  // Detect streak increase and trigger celebration
  useEffect(() => {
    if (currentStreak > previousStreak && currentStreak > 0) {
      triggerStreakCelebration();
    }
    setPreviousStreak(currentStreak);
  }, [currentStreak, previousStreak]);

  const triggerStreakCelebration = () => {
    setShowCelebration(true);
    
    // Confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
    });

    // Auto-hide celebration after 3 seconds
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const getStreakLevel = (streak: number) => {
    if (streak >= 30) return { level: 'legendary', color: 'from-purple-500 to-pink-500', icon: Award };
    if (streak >= 21) return { level: 'master', color: 'from-yellow-500 to-orange-500', icon: Medal };
    if (streak >= 14) return { level: 'expert', color: 'from-blue-500 to-indigo-500', icon: Star };
    if (streak >= 7) return { level: 'champion', color: 'from-green-500 to-emerald-500', icon: Trophy };
    if (streak >= 3) return { level: 'rising', color: 'from-orange-400 to-red-500', icon: Flame };
    return { level: 'beginner', color: 'from-gray-400 to-gray-500', icon: Target };
  };

  const streakInfo = getStreakLevel(currentStreak);
  const StreakIcon = streakInfo.icon;

  const getMilestoneProgress = () => {
    const milestones = [3, 7, 14, 21, 30];
    const nextMilestone = milestones.find(m => m > currentStreak) || 50;
    const previousMilestone = milestones.filter(m => m <= currentStreak).pop() || 0;
    const progress = ((currentStreak - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
    return { nextMilestone, progress: Math.min(100, progress) };
  };

  const { nextMilestone, progress } = getMilestoneProgress();

  return (
    <Card className={cn(
      "relative overflow-hidden p-6 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-2",
      todayCompleted ? "border-orange-300 shadow-lg shadow-orange-200/50" : "border-gray-200",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 25% 25%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 75% 75%, #ef4444 0%, transparent 50%)"
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 0.8,
                  repeat: 2
                }}
              >
                <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              </motion.div>
              <p className="text-lg font-bold text-orange-700">Streak Extended!</p>
              <p className="text-sm text-orange-600">{currentStreak} days strong!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className={cn(
                "p-3 rounded-2xl bg-gradient-to-r",
                streakInfo.color
              )}
              whileHover={{ scale: 1.1 }}
              animate={currentStreak > 0 ? {
                boxShadow: [
                  "0 0 0 0 rgba(251, 146, 60, 0.4)",
                  "0 0 0 20px rgba(251, 146, 60, 0)",
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <StreakIcon className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Daily Streak</h3>
              <p className="text-sm text-gray-600 capitalize">{streakInfo.level} Level</p>
            </div>
          </div>

          {/* Status Badge */}
          <motion.div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold border",
              todayCompleted 
                ? "bg-green-100 text-green-700 border-green-200" 
                : "bg-orange-100 text-orange-700 border-orange-200"
            )}
            animate={todayCompleted ? {} : { 
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {todayCompleted ? "✅ Completed" : "⏰ Pending"}
          </motion.div>
        </div>

        {/* Streak Numbers */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <motion.div
              className="text-3xl font-black text-orange-600"
              animate={currentStreak > previousStreak ? {
                scale: [1, 1.3, 1],
                color: ["#ea580c", "#f59e0b", "#ea580c"]
              } : {}}
              transition={{ duration: 0.6 }}
            >
              {currentStreak}
            </motion.div>
            <div className="text-xs text-gray-600 font-medium">Current</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-gray-700">{longestStreak}</div>
            <div className="text-xs text-gray-600 font-medium">Best Ever</div>
          </div>
        </div>

        {/* Progress to Next Milestone */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Next milestone: {nextMilestone} days</span>
            <span>{Math.max(0, nextMilestone - currentStreak)} days to go</span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            
            {/* Sparkle effect on progress bar */}
            {progress > 0 && (
              <motion.div
                className="absolute top-0 h-full w-4 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                animate={{ x: [-20, progress > 80 ? 100 : (progress / 100) * 200] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>
        </div>

        {/* Streak Calendar Preview */}
        <div className="grid grid-cols-7 gap-1">
          {[...Array(7)].map((_, i) => {
            const dayIndex = 6 - i;
            const isCompleted = dayIndex < currentStreak;
            const isToday = dayIndex === 0;
            
            return (
              <motion.div
                key={i}
                className={cn(
                  "w-6 h-6 rounded border-2 flex items-center justify-center text-xs font-bold",
                  isCompleted
                    ? "bg-orange-100 border-orange-300 text-orange-700"
                    : "bg-gray-100 border-gray-200 text-gray-400",
                  isToday && todayCompleted && "ring-2 ring-orange-400 ring-opacity-50"
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.2 }}
              >
                {isCompleted ? (
                  <Flame className="w-3 h-3" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Motivational Message */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-gray-600">
            {currentStreak === 0 && "Start your learning streak today!"}
            {currentStreak === 1 && "Great start! Keep the momentum going."}
            {currentStreak > 1 && currentStreak < 7 && "You're building a habit! 🔥"}
            {currentStreak >= 7 && currentStreak < 14 && "Excellent consistency! 🏆"}
            {currentStreak >= 14 && currentStreak < 21 && "You're on fire! Amazing dedication! ⭐"}
            {currentStreak >= 21 && currentStreak < 30 && "Incredible commitment! You're a master! 🥇"}
            {currentStreak >= 30 && "Legendary streak! You're unstoppable! 👑"}
          </p>
        </motion.div>
      </div>
    </Card>
  );
};

export default EnhancedStreakCard;