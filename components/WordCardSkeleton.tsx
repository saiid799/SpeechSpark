import React from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface WordCardSkeletonProps {
  className?: string;
}

const WordCardSkeleton: React.FC<WordCardSkeletonProps> = ({ className }) => {
  return (
    <motion.div
      className={cn("group relative", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Card Container */}
      <div className="relative overflow-hidden rounded-2xl backdrop-blur-lg p-6 border bg-gradient-to-br from-muted/20 via-muted/10 to-muted/5 border-muted/30">
        
        {/* Shimmer overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
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

        {/* Card Content */}
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 mt-8">
              {/* Main word skeleton */}
              <Skeleton className="h-9 w-32 mb-3 rounded-lg" />
              {/* Translation skeleton */}
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
            
            {/* Speech button skeleton */}
            <div className="mt-8">
              <Skeleton className="h-11 w-11 rounded-full" />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 space-y-3">
            {/* Action Button skeleton */}
            <Skeleton className="w-full h-12 rounded-xl" />

            {/* Stats skeleton (optional) */}
            <div className="flex justify-between gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WordCardSkeleton;