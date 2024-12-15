import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuizStatsProps {
  correctAnswers: number;
  totalQuestions: number;
  streak: number;
}

export const QuizStats: React.FC<QuizStatsProps> = ({
  correctAnswers,
  totalQuestions,
  streak,
}) => {
  // Calculate actual values
  const calculateScore = () =>
    Math.min(correctAnswers * 100 + streak * 50, 1000);
  const calculateAccuracy = () =>
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  // Initialize state with actual values
  const initialStats = {
    score: calculateScore(),
    accuracy: calculateAccuracy(),
    streak: streak,
  };

  const [animatedStats, setAnimatedStats] = useState(initialStats);

  useEffect(() => {
    const targetStats = {
      score: calculateScore(),
      accuracy: calculateAccuracy(),
      streak: streak,
    };

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      if (step >= steps) {
        clearInterval(timer);
        setAnimatedStats(targetStats);
        return;
      }

      setAnimatedStats((prev) => ({
        score: prev.score + (targetStats.score - prev.score) / (steps - step),
        accuracy:
          prev.accuracy +
          (targetStats.accuracy - prev.accuracy) / (steps - step),
        streak:
          prev.streak + (targetStats.streak - prev.streak) / (steps - step),
      }));

      step++;
    }, interval);

    return () => clearInterval(timer);
  }, [correctAnswers, totalQuestions, streak]);

  const getGradeClass = (
    value: number,
    type: "score" | "accuracy" | "streak"
  ) => {
    const thresholds = {
      score: { excellent: 900, good: 700, average: 500 },
      accuracy: { excellent: 90, good: 75, average: 60 },
      streak: { excellent: 10, good: 7, average: 5 },
    };

    const { excellent, good, average } = thresholds[type];

    if (value >= excellent) return "from-emerald-500 to-green-500";
    if (value >= good) return "from-blue-500 to-indigo-500";
    if (value >= average) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const getLabel = (value: number, type: "score" | "accuracy" | "streak") => {
    const thresholds = {
      score: { excellent: 900, good: 700, average: 500 },
      accuracy: { excellent: 90, good: 75, average: 60 },
      streak: { excellent: 10, good: 7, average: 5 },
    };

    const { excellent, good, average } = thresholds[type];

    if (value >= excellent) return "Outstanding!";
    if (value >= good) return "Great Job!";
    if (value >= average) return "Good Progress!";
    return "Keep Going!";
  };

  const StatCard = ({
    title,
    value,
    max,
    icon: Icon,
    type,
    suffix = "",
  }: {
    title: string;
    value: number;
    max: number;
    icon: typeof Trophy | typeof Target | typeof TrendingUp;
    type: "score" | "accuracy" | "streak";
    suffix?: string;
  }) => {
    const displayValue = Math.max(Math.round(value), 0); // Prevent negative values
    const percentage = (displayValue / max) * 100;
    const colorClass = getGradeClass(displayValue, type);
    const label = getLabel(displayValue, type);

    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative h-full bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-foreground/10 hover:border-primary/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-foreground/60">
                {title}
              </span>
            </div>
            <motion.span
              className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {label}
            </motion.span>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <motion.span
                className={`text-4xl font-bold bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {displayValue}
                {suffix}
              </motion.span>
              <span className="text-sm text-foreground/60">
                / {max}
                {suffix}
              </span>
            </div>

            <div className="relative">
              <Progress value={percentage} className="h-2" />
              <motion.div
                className="mt-1 text-center text-xs text-foreground/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {Math.round(percentage)}% complete
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Total Score"
        value={animatedStats.score}
        max={1000}
        icon={Trophy}
        type="score"
      />
      <StatCard
        title="Accuracy"
        value={animatedStats.accuracy}
        max={100}
        icon={Target}
        type="accuracy"
        suffix="%"
      />
      <StatCard
        title="Best Streak"
        value={animatedStats.streak}
        max={15}
        icon={TrendingUp}
        type="streak"
      />
    </div>
  );
};

export default QuizStats;
