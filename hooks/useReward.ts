import { useState, useCallback } from "react";

interface UseRewardResult {
  points: number;
  addPoints: (amount: number) => void;
  resetPoints: () => void;
}

export const useReward = (): UseRewardResult => {
  const [points, setPoints] = useState(0);

  const addPoints = useCallback((amount: number) => {
    setPoints((prevPoints) => prevPoints + amount);
  }, []);

  const resetPoints = useCallback(() => {
    setPoints(0);
  }, []);

  return { points, addPoints, resetPoints };
};
