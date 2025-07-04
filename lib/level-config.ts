// Centralized level configuration to ensure consistency across the app

export const WORDS_PER_PAGE = 50;  // Words displayed per UI page
export const WORDS_PER_BATCH = 50; // Words per learning batch (same as page for now)
export const WORDS_PER_LEVEL = 1000; // Words needed to complete a level and progress to next
export const BATCHES_PER_LEVEL = Math.ceil(WORDS_PER_LEVEL / WORDS_PER_BATCH); // 20 batches per level

// Progression thresholds for more flexible learning
export const MIN_COMPLETION_PERCENTAGE = 0.8; // 80% completion required to progress
export const MIN_WORDS_FOR_PROGRESSION = Math.floor(WORDS_PER_PAGE * MIN_COMPLETION_PERCENTAGE); // 40 words

export const PROFICIENCY_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type ProficiencyLevel = typeof PROFICIENCY_LEVELS[number];

export const LEVEL_DETAILS: Record<ProficiencyLevel, {
  name: string;
  description: string;
  wordsToComplete: number;
  totalPages: number;
  nextLevel?: ProficiencyLevel;
}> = {
  A1: {
    name: 'Beginner',
    description: 'Basic everyday expressions and simple phrases',
    wordsToComplete: WORDS_PER_LEVEL,
    totalPages: Math.ceil(WORDS_PER_LEVEL / WORDS_PER_PAGE),
    nextLevel: 'A2'
  },
  A2: {
    name: 'Elementary',
    description: 'Common expressions and routine information',
    wordsToComplete: WORDS_PER_LEVEL,
    totalPages: Math.ceil(WORDS_PER_LEVEL / WORDS_PER_PAGE),
    nextLevel: 'B1'
  },
  B1: {
    name: 'Intermediate',
    description: 'Work, school, leisure topics and familiar matters',
    wordsToComplete: WORDS_PER_LEVEL,
    totalPages: Math.ceil(WORDS_PER_LEVEL / WORDS_PER_PAGE),
    nextLevel: 'B2'
  },
  B2: {
    name: 'Upper Intermediate',
    description: 'Complex topics and abstract ideas',
    wordsToComplete: WORDS_PER_LEVEL,
    totalPages: Math.ceil(WORDS_PER_LEVEL / WORDS_PER_PAGE),
    nextLevel: 'C1'
  },
  C1: {
    name: 'Advanced',
    description: 'Wide range of demanding topics and implicit meaning',
    wordsToComplete: WORDS_PER_LEVEL,
    totalPages: Math.ceil(WORDS_PER_LEVEL / WORDS_PER_PAGE),
    nextLevel: 'C2'
  },
  C2: {
    name: 'Proficient',
    description: 'Virtually everything heard or read with ease',
    wordsToComplete: WORDS_PER_LEVEL,
    totalPages: Math.ceil(WORDS_PER_LEVEL / WORDS_PER_PAGE)
  }
};

export function getNextLevel(currentLevel: ProficiencyLevel): ProficiencyLevel | null {
  return LEVEL_DETAILS[currentLevel].nextLevel || null;
}

export function getPreviousLevel(currentLevel: ProficiencyLevel): ProficiencyLevel | null {
  const currentIndex = PROFICIENCY_LEVELS.indexOf(currentLevel);
  return currentIndex > 0 ? PROFICIENCY_LEVELS[currentIndex - 1] : null;
}

export function canProgressToLevel(currentLevel: ProficiencyLevel, learnedWordsInLevel: number): boolean {
  return learnedWordsInLevel >= LEVEL_DETAILS[currentLevel].wordsToComplete;
}

export function getCurrentBatch(learnedWordsInLevel: number): number {
  if (learnedWordsInLevel === 0) return 1;
  
  // Calculate which batch the user should be working on based on learned words
  // Each batch should contain exactly WORDS_PER_BATCH (50) words
  const completedFullBatches = Math.floor(learnedWordsInLevel / WORDS_PER_BATCH);
  const wordsInCurrentBatch = learnedWordsInLevel % WORDS_PER_BATCH;
  
  // If user has completed full batches and has no words in progress,
  // they should work on the next batch
  if (wordsInCurrentBatch === 0) {
    // User has completed full batches, move to next batch
    return Math.min(completedFullBatches + 1, BATCHES_PER_LEVEL);
  } else {
    // User is in the middle of a batch, stay in current batch
    return Math.min(completedFullBatches + 1, BATCHES_PER_LEVEL);
  }
}

export function getCurrentPage(learnedWordsInLevel: number): number {
  // For now, page and batch are the same since WORDS_PER_PAGE === WORDS_PER_BATCH
  return getCurrentBatch(learnedWordsInLevel);
}

export function canMoveToNextPage(wordsInCurrentPage: number, learnedCount: number): boolean {
  return learnedCount >= MIN_WORDS_FOR_PROGRESSION && wordsInCurrentPage >= MIN_WORDS_FOR_PROGRESSION;
}

export function getLevelProgress(learnedWordsInLevel: number, level: ProficiencyLevel): {
  percentage: number;
  wordsRemaining: number;
  canProgress: boolean;
} {
  const targetWords = LEVEL_DETAILS[level].wordsToComplete;
  const percentage = Math.min(100, (learnedWordsInLevel / targetWords) * 100);
  const wordsRemaining = Math.max(0, targetWords - learnedWordsInLevel);
  const canProgress = learnedWordsInLevel >= targetWords;
  
  return {
    percentage,
    wordsRemaining,
    canProgress
  };
}

export function getBatchProgress(learnedWordsInBatch: number): {
  percentage: number;
  wordsRemaining: number;
  isCompleted: boolean;
} {
  const percentage = Math.min(100, (learnedWordsInBatch / WORDS_PER_BATCH) * 100);
  const wordsRemaining = Math.max(0, WORDS_PER_BATCH - learnedWordsInBatch);
  const isCompleted = learnedWordsInBatch >= WORDS_PER_BATCH;
  
  return {
    percentage,
    wordsRemaining,
    isCompleted
  };
}

export function canMoveToNextBatch(wordsInCurrentBatch: number, learnedCount: number): boolean {
  return learnedCount >= MIN_WORDS_FOR_PROGRESSION && wordsInCurrentBatch >= MIN_WORDS_FOR_PROGRESSION;
}

export function getCompletedBatches(learnedWordsInLevel: number): number[] {
  const completedCount = Math.floor(learnedWordsInLevel / WORDS_PER_BATCH);
  return Array.from({ length: completedCount }, (_, i) => i + 1);
}

// Validation functions for batch integrity
export function validateBatchIntegrity(batchWordCount: number): {
  isValid: boolean;
  expectedWords: number;
  actualWords: number;
  wordsNeeded: number;
} {
  const expectedWords = WORDS_PER_BATCH;
  const isValid = batchWordCount === expectedWords;
  const wordsNeeded = Math.max(0, expectedWords - batchWordCount);
  
  return {
    isValid,
    expectedWords,
    actualWords: batchWordCount,
    wordsNeeded
  };
}

export function isCompleteBatch(batchWordCount: number): boolean {
  return batchWordCount === WORDS_PER_BATCH;
}

export function getBatchCompletionPercentage(batchWordCount: number): number {
  return Math.min(100, (batchWordCount / WORDS_PER_BATCH) * 100);
}