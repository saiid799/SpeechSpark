import { useState, useEffect, useCallback } from 'react';

export interface SwipeDirection {
  deltaX: number;
  deltaY: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
}

export interface SwipeGestureOptions {
  threshold?: number; // Minimum distance to trigger swipe
  preventDefaultTouchmoveEvent?: boolean;
  deltaThreshold?: number; // Minimum delta to determine direction
}

export interface SwipeGestureCallbacks {
  onSwipeLeft?: (swipe: SwipeDirection) => void;
  onSwipeRight?: (swipe: SwipeDirection) => void;
  onSwipeUp?: (swipe: SwipeDirection) => void;
  onSwipeDown?: (swipe: SwipeDirection) => void;
  onSwipeStart?: (event: TouchEvent | MouseEvent) => void;
  onSwipeEnd?: (swipe: SwipeDirection) => void;
  onSwiping?: (swipe: SwipeDirection) => void;
}

export const useSwipeGesture = (
  callbacks: SwipeGestureCallbacks,
  options: SwipeGestureOptions = {}
) => {
  const {
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
    deltaThreshold = 5
  } = options;

  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const getSwipeDirection = useCallback((deltaX: number, deltaY: number): SwipeDirection => {
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    let direction: 'left' | 'right' | 'up' | 'down' | null = null;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > deltaThreshold) {
        direction = deltaX > 0 ? 'right' : 'left';
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > deltaThreshold) {
        direction = deltaY > 0 ? 'down' : 'up';
      }
    }

    return { deltaX, deltaY, direction, distance };
  }, [deltaThreshold]);

  const handleStart = useCallback((clientX: number, clientY: number, event: TouchEvent | MouseEvent) => {
    setStartPos({ x: clientX, y: clientY });
    setCurrentPos({ x: clientX, y: clientY });
    setIsSwiping(true);
    callbacks.onSwipeStart?.(event);
  }, [callbacks]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!startPos || !isSwiping) return;

    setCurrentPos({ x: clientX, y: clientY });
    
    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;
    const swipe = getSwipeDirection(deltaX, deltaY);
    
    callbacks.onSwiping?.(swipe);
  }, [startPos, isSwiping, getSwipeDirection, callbacks]);

  const handleEnd = useCallback(() => {
    if (!startPos || !currentPos || !isSwiping) {
      setIsSwiping(false);
      return;
    }

    const deltaX = currentPos.x - startPos.x;
    const deltaY = currentPos.y - startPos.y;
    const swipe = getSwipeDirection(deltaX, deltaY);

    // Only trigger callback if swipe distance exceeds threshold
    if (swipe.distance >= threshold && swipe.direction) {
      switch (swipe.direction) {
        case 'left':
          callbacks.onSwipeLeft?.(swipe);
          break;
        case 'right':
          callbacks.onSwipeRight?.(swipe);
          break;
        case 'up':
          callbacks.onSwipeUp?.(swipe);
          break;
        case 'down':
          callbacks.onSwipeDown?.(swipe);
          break;
      }
    }

    callbacks.onSwipeEnd?.(swipe);
    setStartPos(null);
    setCurrentPos(null);
    setIsSwiping(false);
  }, [startPos, currentPos, isSwiping, getSwipeDirection, threshold, callbacks]);

  // Touch event handlers
  const onTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    handleStart(touch.clientX, touch.clientY, event);
  }, [handleStart]);

  const onTouchMove = useCallback((event: TouchEvent) => {
    if (preventDefaultTouchmoveEvent) {
      event.preventDefault();
    }
    const touch = event.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove, preventDefaultTouchmoveEvent]);

  const onTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Mouse event handlers (for desktop testing)
  const onMouseDown = useCallback((event: MouseEvent) => {
    handleStart(event.clientX, event.clientY, event);
  }, [handleStart]);

  const onMouseMove = useCallback((event: MouseEvent) => {
    handleMove(event.clientX, event.clientY);
  }, [handleMove]);

  const onMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Event listeners
  useEffect(() => {
    const element = document;

    if (isSwiping) {
      element.addEventListener('touchmove', onTouchMove, { passive: !preventDefaultTouchmoveEvent });
      element.addEventListener('touchend', onTouchEnd);
      element.addEventListener('mousemove', onMouseMove);
      element.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
      element.removeEventListener('mousemove', onMouseMove);
      element.removeEventListener('mouseup', onMouseUp);
    };
  }, [isSwiping, onTouchMove, onTouchEnd, onMouseMove, onMouseUp, preventDefaultTouchmoveEvent]);

  // Current swipe state
  const currentSwipe = startPos && currentPos ? getSwipeDirection(
    currentPos.x - startPos.x,
    currentPos.y - startPos.y
  ) : null;

  return {
    // Event handlers to attach to your element
    onTouchStart,
    onMouseDown,
    
    // Current swipe state
    isSwiping,
    currentSwipe,
    
    // Helper to get progress (0-1) toward threshold
    getSwipeProgress: () => {
      if (!currentSwipe) return 0;
      return Math.min(1, currentSwipe.distance / threshold);
    }
  };
};