// File: components/experience/reviewManager.ts

import { Question } from "@/types/word-learning";

export interface ReviewItem {
  question: Question;
  easeFactor: number;
  interval: number;
  dueDate: Date;
  repetitions: number;
  correctAnswers: number;
}

export interface ReviewState {
  items: ReviewItem[];
  currentIndex: number;
}

const INITIAL_EASE_FACTOR = 2.5;
const INITIAL_INTERVAL = 1; // 1 day

export const initializeReviewState = (mistakes: Question[]): ReviewState => {
  const now = new Date();
  return {
    items: mistakes.map((question) => ({
      question,
      easeFactor: INITIAL_EASE_FACTOR,
      interval: INITIAL_INTERVAL,
      dueDate: now,
      repetitions: 0,
      correctAnswers: 0,
    })),
    currentIndex: 0,
  };
};

export const updateReviewState = (
  state: ReviewState,
  quality: number // 0-5, where 5 is perfect recall
): ReviewState => {
  const { items, currentIndex } = state;
  const item = items[currentIndex];

  let newEaseFactor =
    item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  let newInterval;
  if (item.repetitions === 0) {
    newInterval = 1;
  } else if (item.repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(item.interval * newEaseFactor);
  }

  const now = new Date();
  const newDueDate = new Date(
    now.getTime() + newInterval * 24 * 60 * 60 * 1000
  );

  const isCorrect = quality >= 4;
  const newCorrectAnswers = isCorrect ? item.correctAnswers + 1 : 0;

  const updatedItems = [...items];
  updatedItems[currentIndex] = {
    ...item,
    easeFactor: newEaseFactor,
    interval: newInterval,
    dueDate: newDueDate,
    repetitions: item.repetitions + 1,
    correctAnswers: newCorrectAnswers,
  };

  // If answer was incorrect or it's the first correct answer,
  // move the item to the end of the list
  if (!isCorrect || newCorrectAnswers === 1) {
    const currentItem = updatedItems.splice(currentIndex, 1)[0];
    updatedItems.push(currentItem);
  }

  // Move to next item, or back to start if we've reached the end
  const newIndex = (currentIndex + 1) % updatedItems.length;

  return {
    items: updatedItems,
    currentIndex: newIndex,
  };
};

export const isReviewComplete = (state: ReviewState): boolean => {
  return state.items.every((item) => item.correctAnswers >= 2);
};

export const getProgress = (state: ReviewState): number => {
  const totalItems = state.items.length * 2; // Each item needs to be answered correctly twice
  const completedItems = state.items.reduce(
    (sum, item) => sum + Math.min(item.correctAnswers, 2),
    0
  );
  return (completedItems / totalItems) * 100;
};
