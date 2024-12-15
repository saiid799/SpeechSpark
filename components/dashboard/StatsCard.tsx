// File: components/dashboard/StatsCard.tsx

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

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
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}) => {
  const getGradientColor = () => {
    switch (title) {
      case "Words Learned":
        return "from-emerald-500/20 via-teal-500/20 to-green-500/20 group-hover:from-emerald-500/30 group-hover:via-teal-500/30 group-hover:to-green-500/30";
      case "Current Level":
        return "from-blue-500/20 via-indigo-500/20 to-violet-500/20 group-hover:from-blue-500/30 group-hover:via-indigo-500/30 group-hover:to-violet-500/30";
      case "Daily Streak":
        return "from-orange-500/20 via-amber-500/20 to-yellow-500/20 group-hover:from-orange-500/30 group-hover:via-amber-500/30 group-hover:to-yellow-500/30";
      case "Accuracy":
        return "from-red-500/20 via-pink-500/20 to-rose-500/20 group-hover:from-red-500/30 group-hover:via-pink-500/30 group-hover:to-rose-500/30";
      default:
        return "from-primary/20 via-secondary/20 to-accent/20 group-hover:from-primary/30 group-hover:via-secondary/30 group-hover:to-accent/30";
    }
  };

  const getIconColor = () => {
    switch (title) {
      case "Words Learned":
        return "text-emerald-500";
      case "Current Level":
        return "text-blue-500";
      case "Daily Streak":
        return "text-orange-500";
      case "Accuracy":
        return "text-red-500";
      default:
        return "text-primary";
    }
  };

  const getTitleGradient = () => {
    switch (title) {
      case "Words Learned":
        return "from-emerald-500 to-green-600";
      case "Current Level":
        return "from-blue-500 to-violet-600";
      case "Daily Streak":
        return "from-orange-500 to-amber-600";
      case "Accuracy":
        return "from-red-500 to-rose-600";
      default:
        return "from-primary to-accent";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card
        className={`relative overflow-hidden p-6 backdrop-blur-md border-foreground/10 hover:border-primary/20
        bg-gradient-to-br ${getGradientColor()} transition-all duration-500 hover:shadow-xl`}
      >
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 45, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradientColor()} 
              flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className={`w-6 h-6 ${getIconColor()}`} />
            </div>
            {trend && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg 
                  ${
                    trend.isPositive
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
              >
                {trend.isPositive ? (
                  <ArrowUpIcon className="w-4 h-4" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{trend.value}%</span>
              </motion.div>
            )}
          </div>

          <div className="space-y-2">
            <h3
              className={`text-sm font-medium bg-gradient-to-r ${getTitleGradient()} 
              bg-clip-text text-transparent group-hover:opacity-80 transition-opacity duration-300`}
            >
              {title}
            </h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">{value}</span>
              <span className="text-sm text-foreground/60">{subtitle}</span>
            </div>
          </div>

          {/* Progress Indicator */}
          {typeof value === "number" && (
            <div className="mt-4">
              <div className="h-1 w-full bg-foreground/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${getTitleGradient()}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, value as number)}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
