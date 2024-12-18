// File: components/dashboard/Progress.tsx

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Trophy,
  Target,
  TrendingUp,
  Brain,
  Star,
  Award,
  Flame,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
} from "lucide-react";

import { useApi } from "@/hooks/useApi";

interface UserProgressStats {
  learnedWords: number;
  completedLevels: string[];
  targetWordCount: number;
  proficiencyLevel: string;
  learningLanguage: string;
  words: {
    learned: boolean;
    proficiencyLevel: string;
  }[];
  dailyProgress: DailyProgress[];
  achievements: Achievement[];
}

interface DailyProgress {
  date: string;
  wordsLearned: number;
  accuracy: number;
  streak: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
}

interface LevelProgress {
  total: number;
  learned: number;
}

const Progress = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "week" | "month" | "year"
  >("week");
  const {
    data: progressData,
    request: fetchProgressData,
    isLoading,
  } = useApi<UserProgressStats>();
  const [dailyStats, setDailyStats] = useState<DailyProgress[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchProgressData("/api/user");
    };
    fetchData();

    // Set up an interval to refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchProgressData]);

  useEffect(() => {
    if (progressData?.dailyProgress) {
      const filteredData = filterDataByTimeframe(
        progressData.dailyProgress,
        selectedTimeframe
      );
      setDailyStats(filteredData);
    }
  }, [progressData, selectedTimeframe]);

  const filterDataByTimeframe = (data: DailyProgress[], timeframe: string) => {
    const now = new Date();
    const timeframes = {
      week: 7,
      month: 30,
      year: 365,
    };
    const days = timeframes[timeframe as keyof typeof timeframes];
    const cutoff = new Date(now.setDate(now.getDate() - days));

    return data.filter((item) => new Date(item.date) >= cutoff);
  };

  const metrics = React.useMemo(() => {
    if (!progressData) return null;

    const totalWords = progressData.words.length;
    const learnedWords = progressData.words.filter((w) => w.learned).length;
    const progress = (learnedWords / progressData.targetWordCount) * 100;
    const accuracy = Math.round(
      progressData.dailyProgress.reduce((acc, curr) => acc + curr.accuracy, 0) /
        progressData.dailyProgress.length || 0
    );
    const currentStreak =
      progressData.dailyProgress[progressData.dailyProgress.length - 1]
        ?.streak || 0;

    return {
      totalWords,
      learnedWords,
      progress,
      accuracy,
      currentStreak,
    };
  }, [progressData]);

  if (isLoading || !progressData) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const levelProgress: Record<string, LevelProgress> =
    progressData.words.reduce((acc, word) => {
      const level = word.proficiencyLevel;
      if (!acc[level]) {
        acc[level] = { total: 0, learned: 0 };
      }
      acc[level].total++;
      if (word.learned) acc[level].learned++;
      return acc;
    }, {} as Record<string, LevelProgress>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-background via-background/95 to-primary/10 p-8 rounded-xl border border-foreground/10">
        <h1 className="text-4xl font-bold mb-2">
          Learning{" "}
          <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
            Progress
          </span>
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-5 h-5" />
          <p>Track your {progressData.learningLanguage} learning journey</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Words Mastered"
          value={metrics?.learnedWords || 0}
          subtitle={`of ${metrics?.totalWords || 0} total words`}
          icon={Brain}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Daily Streak"
          value={metrics?.currentStreak || 0}
          subtitle="consecutive days"
          icon={Flame}
          trend={{ value: metrics?.currentStreak || 0, isPositive: true }}
        />
        <StatsCard
          title="Accuracy Rate"
          value={`${metrics?.accuracy || 0}%`}
          subtitle="correct answers"
          icon={Target}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Overall Progress"
          value={`${Math.round(metrics?.progress || 0)}%`}
          subtitle="completion rate"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Progress Chart */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold">Learning Activity</h2>
            <p className="text-sm text-muted-foreground">
              Track your daily progress
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTimeframe === "week" ? "default" : "outline"}
              onClick={() => setSelectedTimeframe("week")}
              size="sm"
            >
              Week
            </Button>
            <Button
              variant={selectedTimeframe === "month" ? "default" : "outline"}
              onClick={() => setSelectedTimeframe("month")}
              size="sm"
            >
              Month
            </Button>
            <Button
              variant={selectedTimeframe === "year" ? "default" : "outline"}
              onClick={() => setSelectedTimeframe("year")}
              size="sm"
            >
              Year
            </Button>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--muted))" />
              <XAxis dataKey="date" stroke="rgb(var(--muted-foreground))" />
              <YAxis stroke="rgb(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(var(--background))",
                  border: "1px solid rgb(var(--muted))",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="wordsLearned"
                name="Words Learned"
                stroke="rgb(var(--primary))"
                strokeWidth={2}
                dot={{ stroke: "rgb(var(--primary))", strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: "rgb(var(--background))" }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                name="Accuracy (%)"
                stroke="rgb(var(--secondary))"
                strokeWidth={2}
                dot={{ stroke: "rgb(var(--secondary))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Level Progress */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-2">Proficiency Levels</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Track your progress across different language levels
        </p>
        <div className="space-y-6">
          {Object.entries(levelProgress).map(([level, data]) => (
            <div key={level} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Level {level}</span>
                <span className="text-sm text-muted-foreground">
                  {data.learned}/{data.total} words
                </span>
              </div>
              <div className="relative pt-1">
                <ProgressBar
                  value={(data.learned / data.total) * 100}
                  className="h-2"
                />
                <span className="absolute right-0 -top-1 text-xs text-muted-foreground">
                  {Math.round((data.learned / data.total) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Achievements & Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Achievements */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Recent Achievements</h2>
              <p className="text-sm text-muted-foreground">
                Your latest language learning milestones
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {progressData.achievements.slice(0, 3).map((achievement) => (
              <Achievement
                key={achievement.id}
                icon={getAchievementIcon(achievement.type)}
                title={achievement.title}
                description={achievement.description}
                date={new Date(achievement.date).toLocaleDateString()}
              />
            ))}
          </div>
        </Card>

        {/* Learning Goals */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Learning Goals</h2>
              <p className="text-sm text-muted-foreground">
                Track your progress towards your goals
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <Goal
              title="Daily Practice Goal"
              current={metrics?.currentStreak || 0}
              target={7}
              unit="days"
            />
            <Goal
              title="Weekly New Words"
              current={metrics?.learnedWords || 0}
              target={100}
              unit="words"
            />
            <Goal
              title="Accuracy Target"
              current={metrics?.accuracy || 0}
              target={95}
              unit="%"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({
  value,
  subtitle,
  icon: Icon,
  trend,
}) => (
  <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      {trend && (
        <div
          className={`flex items-center gap-1 text-sm ${
            trend.isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {trend.isPositive ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          {trend.value}%
        </div>
      )}
    </div>
    <div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{subtitle}</div>
    </div>
  </Card>
);

interface AchievementProps {
  icon: React.ElementType;
  title: string;
  description: string;
  date: string;
}

const Achievement: React.FC<AchievementProps> = ({
  icon: Icon,
  title,
  description,
  date,
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all duration-300"
  >
    <div className="p-2 rounded-lg bg-primary/10">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div className="flex-1">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="text-xs text-muted-foreground whitespace-nowrap">
      {date}
    </div>
  </motion.div>
);

interface GoalProps {
  title: string;
  current: number;
  target: number;
  unit: string;
}

const Goal: React.FC<GoalProps> = ({ title, current, target, unit }) => {
  const progress = Math.min((current / target) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">
          {current}/{target} {unit}
        </span>
      </div>
      <div className="relative">
        <ProgressBar value={progress} className="h-2" />
        <span className="absolute right-0 -top-6 text-xs text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

// Utility function to get the appropriate icon for different achievement types
const getAchievementIcon = (type: string): React.ElementType => {
  const icons = {
    streak: Flame,
    completion: CheckCircle,
    milestone: Trophy,
    mastery: Star,
    accuracy: Target,
    default: Award,
  };

  return icons[type as keyof typeof icons] || icons.default;
};

export default Progress;
