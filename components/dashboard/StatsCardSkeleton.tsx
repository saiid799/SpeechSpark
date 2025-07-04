import React from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatsCardSkeletonProps {
  className?: string;
}

const StatsCardSkeleton: React.FC<StatsCardSkeletonProps> = ({ className }) => {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-muted/20 to-muted/5 border border-muted/30",
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: [-100, 100],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            ease: "linear"
          }}
          style={{ width: "80px" }}
        />
      </div>

      <div className="relative z-10 flex items-center gap-4">
        {/* Icon skeleton */}
        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          {/* Title skeleton */}
          <Skeleton className="h-4 w-20 mb-2 rounded" />
          
          {/* Value skeleton */}
          <Skeleton className="h-7 w-16 mb-1 rounded" />
          
          {/* Subtitle skeleton */}
          <Skeleton className="h-3 w-24 mb-3 rounded" />
          
          {/* Progress bar skeleton */}
          <div className="space-y-1">
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCardSkeleton;