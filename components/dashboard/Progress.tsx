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
} from "lucide-react";
import { useApi } from "@/hooks/useApi";

interface ProgressStats {
  learnedWords: number;
  completedLevels: string[];
  targetWordCount: number;
  proficiencyLevel: string;
  learningLanguage: string;
  words: {
    learned: boolean;
    proficiencyLevel: string;
  }[];
}

interface ChartData {
  name: string;
  words: number;
  accuracy: number;
  streak: number;
}

const METRICS = {
  WORDS: "words",
  ACCURACY: "accuracy",
  STREAK: "streak",
} as const;

type MetricType = typeof METRICS[keyof typeof METRICS];

const Progress: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"week" | "month" | "year">("week");
  const [selectedMetric] = useState<MetricType>(METRICS.WORDS);
  const { data: progressData, request: fetchProgressData, isLoading } = useApi<ProgressStats>();

  useEffect(() => {
    fetchProgressData("/api/user");
  }, [fetchProgressData]);

  const metrics = React.useMemo(() => {
    if (!progressData) return null;

    const totalWords = progressData.words.length;
    const learnedWords = progressData.words.filter((w) => w.learned).length;
    const progress = (learnedWords / progressData.targetWordCount) * 100;
    const accuracy = Math.round((learnedWords / totalWords) * 100) || 0;
    const streak = 7; // Example value - implement actual streak calculation

    return {
      totalWords,
      learnedWords,
      progress,
      accuracy,
      streak,
    };
  }, [progressData]);

  const chartData: ChartData[] = React.useMemo(() => {
    if (selectedTimeframe === "week") {
      return [
        { name: "Mon", words: 12, accuracy: 85, streak: 1 },
        { name: "Tue", words: 15, accuracy: 90, streak: 2 },
        { name: "Wed", words: 18, accuracy: 88, streak: 3 },
        { name: "Thu", words: 22, accuracy: 92, streak: 4 },
        { name: "Fri", words: 25, accuracy: 95, streak: 5 },
        { name: "Sat", words: 30, accuracy: 89, streak: 6 },
        { name: "Sun", words: 28, accuracy: 91, streak: 7 },
      ];
    }
    // Add month and year data handlers here
    return [];
  }, [selectedTimeframe]);

  const levelProgress = React.useMemo(() => {
    if (!progressData) return [];
    
    const levels = ["A1", "A2", "B1", "B2", "C1"];
    return levels.map(level => {
      const levelWords = progressData.words.filter(w => w.proficiencyLevel === level);
      const completed = levelWords.filter(w => w.learned).length;
      const target = levelWords.length;
      return {
        level,
        completed: completed || 0,
        target: target || 100,
        percentage: target ? Math.round((completed / target) * 100) : 0,
      };
    });
  }, [progressData]);

  if (isLoading) {
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

  return (
    <div className="space-y-6">
      {/* Header with Gradient Background */}
      <div className="bg-gradient-to-r from-background via-background/95 to-primary/10 p-8 rounded-xl border border-foreground/10">
        <h1 className="text-4xl font-bold mb-2">
          Learning{" "}
          <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
            Progress
          </span>
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-5 h-5" />
          <p>Track your language learning journey and achievements</p>
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
          value={metrics?.streak || 0}
          subtitle="consecutive days"
          icon={Flame}
          trend={{ value: 2, isPositive: true }}
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

      {/* Main Chart */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold">Learning Activity</h2>
            <p className="text-sm text-muted-foreground">Track your daily learning progress</p>
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
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--muted))" />
              <XAxis dataKey="name" stroke="rgb(var(--muted-foreground))" />
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
                dataKey={selectedMetric}
                stroke="rgb(var(--primary))"
                strokeWidth={2}
                dot={{ stroke: "rgb(var(--primary))", strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: "rgb(var(--background))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Level Progress */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-2">Proficiency Levels</h2>
        <p className="text-sm text-muted-foreground mb-6">Track your progress across different language levels</p>
        <div className="space-y-6">
          {levelProgress.map((level) => (
            <div key={level.level} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Level {level.level}</span>
                <span className="text-sm text-muted-foreground">
                  {level.completed}/{level.target} words
                </span>
              </div>
              <div className="relative pt-1">
                <ProgressBar 
                  value={level.percentage}
                  className="h-2"
                />
                <span className="absolute right-0 -top-1 text-xs text-muted-foreground">
                  {level.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Achievements & Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentAchievements />
        <LearningGoals metrics={metrics} />
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
          <TrendingUp className={`w-4 h-4 ${!trend.isPositive && "rotate-180"}`} />
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

const RecentAchievements: React.FC = () => (
  <Card className="p-6">
    <div className="flex items-center gap-2 mb-6">
      <Trophy className="w-5 h-5 text-primary" />
      <div>
        <h2 className="text-xl font-semibold">Recent Achievements</h2>
        <p className="text-sm text-muted-foreground">Your latest language learning milestones</p>
      </div>
    </div>
    <div className="space-y-4">
      <Achievement
        icon={Star}
        title="Perfect Week"
        description="Maintained a 7-day study streak"
        date="Today"
      />
      <Achievement
        icon={Award}
        title="Vocabulary Master"
        description="Learned 100 new words"
        date="Yesterday"
      />
      <Achievement
        icon={Target}
        title="Accuracy Champion"
        description="Achieved 100% accuracy in practice"
        date="2 days ago"
      />
    </div>
  </Card>
);

interface LearningGoalsProps {
  metrics: {
    streak?: number;
    accuracy?: number;
    learnedWords?: number;
  } | null;
}

const LearningGoals: React.FC<LearningGoalsProps> = ({ metrics }) => (
  <Card className="p-6">
    <div className="flex items-center gap-2 mb-6">
      <Target className="w-5 h-5 text-primary" />
      <div>
        <h2 className="text-xl font-semibold">Learning Goals</h2>
        <p className="text-sm text-muted-foreground">Track your progress towards your goals</p>
      </div>
    </div>
    <div className="space-y-6">
      <Goal
        title="Daily Practice Goal"
        current={metrics?.streak || 0}
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
    <div className="text-xs text-muted-foreground whitespace-nowrap">{date}</div>
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

export default Progress;