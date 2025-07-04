import React, { useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeContainerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  threshold?: number;
  showIndicators?: boolean;
  disabled?: boolean;
}

const SwipeContainer: React.FC<SwipeContainerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className,
  threshold = 100,
  showIndicators = true,
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;

    const { offset, velocity } = info;
    const swipeThreshold = threshold;
    const swipeVelocityThreshold = 500;

    // Determine swipe direction based on offset and velocity
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      // Horizontal swipe
      if (offset.x > swipeThreshold || velocity.x > swipeVelocityThreshold) {
        onSwipeRight?.();
      } else if (offset.x < -swipeThreshold || velocity.x < -swipeVelocityThreshold) {
        onSwipeLeft?.();
      }
    } else {
      // Vertical swipe
      if (offset.y > swipeThreshold || velocity.y > swipeVelocityThreshold) {
        onSwipeDown?.();
      } else if (offset.y < -swipeThreshold || velocity.y < -swipeVelocityThreshold) {
        onSwipeUp?.();
      }
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)} ref={containerRef}>
      {/* Swipe Indicators */}
      {showIndicators && !disabled && (
        <>
          {/* Left swipe indicator */}
          {onSwipeLeft && (
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 opacity-30 pointer-events-none">
              <motion.div
                className="flex items-center gap-1 text-gray-600 bg-white/80 backdrop-blur-sm rounded-full px-3 py-2 shadow-sm"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-medium">Swipe</span>
              </motion.div>
            </div>
          )}

          {/* Right swipe indicator */}
          {onSwipeRight && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 opacity-30 pointer-events-none">
              <motion.div
                className="flex items-center gap-1 text-gray-600 bg-white/80 backdrop-blur-sm rounded-full px-3 py-2 shadow-sm"
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <span className="text-xs font-medium">Swipe</span>
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </div>
          )}
        </>
      )}

      {/* Draggable content */}
      <motion.div
        drag={!disabled}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="w-full h-full"
        whileDrag={{ scale: 0.98 }}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeContainer;