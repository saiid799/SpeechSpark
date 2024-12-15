// File: components/dashboard/RecentActivity.tsx

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  Target,
  Star,
  TrendingUp,
  Calendar,
  RotateCcw,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Activity {
  id: string;
  type: 'completion' | 'practice' | 'achievement' | 'streak' | 'review';
  title: string;
  description: string;
  timestamp: Date;
  details?: {
    progress?: number;
    streakCount?: number;
    wordCount?: number;
    accuracy?: number;
  };
}

const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'completion':
      return CheckCircle2;
    case 'practice':
      return Clock;
    case 'achievement':
      return Trophy;
    case 'streak':
      return Sparkles;
    case 'review':
      return RotateCcw;
    default:
      return Star;
  }
};

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'completion':
      return 'text-green-500 bg-green-500/10';
    case 'practice':
      return 'text-blue-500 bg-blue-500/10';
    case 'achievement':
      return 'text-yellow-500 bg-yellow-500/10';
    case 'streak':
      return 'text-purple-500 bg-purple-500/10';
    case 'review':
      return 'text-orange-500 bg-orange-500/10';
    default:
      return 'text-primary bg-primary/10';
  }
};

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "completion",
    title: "Completed Daily Goal",
    description: "Mastered 10 new words",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    details: {
      wordCount: 10,
      accuracy: 95,
    },
  },
  {
    id: "2",
    type: "streak",
    title: "7-Day Streak!",
    description: "You're on fire! Keep it up!",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    details: {
      streakCount: 7,
      progress: 100,
    },
  },
  {
    id: "3",
    type: "practice",
    title: "Practice Completed",
    description: "Basic Greetings & Phrases",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    details: {
      accuracy: 85,
      wordCount: 15,
    },
  },
  {
    id: "4",
    type: "achievement",
    title: "Level Milestone",
    description: "50% through Level A1",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    details: {
      progress: 50,
    },
  },
  {
    id: "5",
    type: "review",
    title: "Review Completed",
    description: "Reviewed previously learned words",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    details: {
      wordCount: 20,
      accuracy: 90,
    },
  },
];

const ActivityDetails: React.FC<{ activity: Activity }> = ({ activity }) => {
  if (!activity.details) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-2 space-y-2 px-1"
    >
      {activity.details.progress !== undefined && (
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{activity.details.progress}%</span>
          </div>
          <Progress value={activity.details.progress} className="h-1.5" />
        </div>
      )}
      
      {activity.details.accuracy !== undefined && (
        <div className="flex items-center text-xs text-muted-foreground">
          <Target className="w-3 h-3 mr-1" />
          <span>Accuracy: {activity.details.accuracy}%</span>
        </div>
      )}

      {activity.details.wordCount !== undefined && (
        <div className="flex items-center text-xs text-muted-foreground">
          <BookOpen className="w-3 h-3 mr-1" />
          <span>Words: {activity.details.wordCount}</span>
        </div>
      )}

      {activity.details.streakCount !== undefined && (
        <div className="flex items-center text-xs text-muted-foreground">
          <TrendingUp className="w-3 h-3 mr-1" />
          <span>Streak: {activity.details.streakCount} days</span>
        </div>
      )}
    </motion.div>
  );
};

const RecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prevActivities => 
        prevActivities.map(activity => ({
          ...activity,
          timestamp: new Date(activity.timestamp.getTime())
        }))
      );
    }, 60000); // Update timestamps every minute

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border border-foreground/10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Track your progress</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          className={`transition-all duration-300 ${isRefreshing ? 'animate-spin' : 'hover:bg-primary/10'}`}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 -mr-2">
        <AnimatePresence mode="popLayout">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="group"
            >
              <div
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-foreground/5 cursor-pointer transition-all duration-200"
                onClick={() => setExpandedActivity(
                  expandedActivity === activity.id ? null : activity.id
                )}
              >
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)} transition-transform duration-200 group-hover:scale-110`}>
                  {React.createElement(getActivityIcon(activity.type), {
                    className: "w-4 h-4"
                  })}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium leading-none mb-1 group-hover:text-primary transition-colors">
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {getRelativeTime(activity.timestamp)}
                    </span>
                  </div>

                  <AnimatePresence>
                    {expandedActivity === activity.id && (
                      <ActivityDetails activity={activity} />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {activities.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecentActivity;