// File: components/dashboard/StatsCard.tsx

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ArrowDownIcon, TrendingUp } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}) => {
  const getCardStyles = () => {
    switch (title) {
      case "Words Learned":
        return {
          gradient: "from-primary/10 via-primary/5 to-transparent",
          iconBg: "bg-primary/15",
          iconColor: "text-primary",
          accentColor: "border-primary/20",
          glowColor: "shadow-primary/10"
        };
      case "Current Level":
        return {
          gradient: "from-secondary/10 via-secondary/5 to-transparent",
          iconBg: "bg-secondary/15",
          iconColor: "text-secondary",
          accentColor: "border-secondary/20",
          glowColor: "shadow-secondary/10"
        };
      case "Daily Streak":
        return {
          gradient: "from-accent/10 via-accent/5 to-transparent",
          iconBg: "bg-accent/15",
          iconColor: "text-accent",
          accentColor: "border-accent/20",
          glowColor: "shadow-accent/10"
        };
      case "Accuracy":
        return {
          gradient: "from-primary/10 via-secondary/5 to-accent/5",
          iconBg: "bg-gradient-to-br from-primary/15 to-secondary/10",
          iconColor: "text-primary",
          accentColor: "border-primary/20",
          glowColor: "shadow-primary/10"
        };
      default:
        return {
          gradient: "from-primary/10 via-primary/5 to-transparent",
          iconBg: "bg-primary/15",
          iconColor: "text-primary",
          accentColor: "border-primary/20",
          glowColor: "shadow-primary/10"
        };
    }
  };

  const cardStyles = getCardStyles();
  const numericValue = typeof value === "number" ? value : parseFloat(value.toString().replace(/[^0-9.]/g, ''));
  const hasProgress = !isNaN(numericValue) && title !== "Current Level";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group h-full"
    >
      <Card className={`relative overflow-hidden h-full bg-gradient-to-br ${cardStyles.gradient} 
        backdrop-blur-xl border border-foreground/5 hover:${cardStyles.accentColor} 
        transition-all duration-300 hover:${cardStyles.glowColor} hover:shadow-2xl
        group-hover:border-opacity-100`}>
        
        {/* Modern mesh gradient background */}
        <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500">
          <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${cardStyles.gradient} rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2`} />
          <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br ${cardStyles.gradient} rounded-full blur-2xl transform translate-x-1/2 translate-y-1/2`} />
        </div>

        {/* Content Container */}
        <div className="relative z-10 p-6 h-full flex flex-col">
          
          {/* Header with Icon and Trend */}
          <div className="flex items-start justify-between mb-6">
            <motion.div
              className={`w-14 h-14 rounded-2xl ${cardStyles.iconBg} border border-foreground/5
                flex items-center justify-center shadow-lg backdrop-blur-sm
                group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
              whileHover={{ scale: 1.15, rotate: 6 }}
            >
              <Icon className={`w-7 h-7 ${cardStyles.iconColor} group-hover:scale-110 transition-transform duration-300`} />
            </motion.div>
            
            {trend && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                  ${trend.isPositive 
                    ? "bg-primary/15 text-primary border border-primary/20" 
                    : "bg-red-500/15 text-red-500 border border-red-500/20"
                  } backdrop-blur-sm shadow-sm`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <ArrowDownIcon className="w-3 h-3" />
                )}
                <span>{trend.label || `+${trend.value}%`}</span>
              </motion.div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 
                className="text-sm font-black text-muted-foreground uppercase tracking-wider mb-2 font-display"
                style={{
                  fontFamily: "'DM Sans', 'Inter', sans-serif",
                  fontWeight: 700,
                  letterSpacing: "-0.01em"
                }}
              >
                {title}
              </h3>
              
              <div className="space-y-1">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="flex items-baseline gap-2"
                >
                  <span 
                    className="text-3xl font-black text-foreground leading-none font-display"
                    style={{
                      fontFamily: "'DM Sans', 'Inter', sans-serif",
                      fontWeight: 800,
                      letterSpacing: "-0.025em"
                    }}
                  >
                    {value}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">
                    {subtitle}
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Modern Progress Bar */}
            {hasProgress && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={`font-semibold ${cardStyles.iconColor}`}>
                    {Math.round(numericValue)}%
                  </span>
                </div>
                <div className="relative h-2 bg-foreground/5 rounded-full overflow-hidden">
                  <motion.div
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, numericValue)}%` }}
                    transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/40 to-transparent rounded-full"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ 
                      width: `${Math.min(100, numericValue)}%`,
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      width: { duration: 1.2, delay: 0.3, ease: "easeOut" },
                      opacity: { duration: 0.8, delay: 0.5, ease: "easeInOut" }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Hover Effect Overlay */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl opacity-0 
              group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
            initial={false}
          />
        </div>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
