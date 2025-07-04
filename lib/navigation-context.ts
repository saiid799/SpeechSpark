// File: lib/navigation-context.ts

import { createContext, useContext } from 'react';

export interface NavigationContext {
  currentBatch: number;
  currentPage: number;
  currentLevel: string;
  learningPath: string[];
  completedWords: string[];
  lastVisited: {
    dashboard: string;
    word: string;
    batch: string;
  };
  returnPath: string;
  batchInfo: {
    batch: number;
    page: number;
    totalPages: number;
  };
}

export interface NavigationState {
  context: NavigationContext;
  updateContext: (updates: Partial<NavigationContext>) => void;
  buildWordUrl: (wordId: string, options?: {
    batch?: number;
    page?: number;
    level?: string;
    isReview?: boolean;
  }) => string;
  buildReturnUrl: (fromWord: string, options?: {
    batch?: number;
    page?: number;
    level?: string;
  }) => string;
  getNavigationHistory: () => NavigationItem[];
  addToHistory: (item: NavigationItem) => void;
}

export interface NavigationItem {
  id: string;
  path: string;
  label: string;
  timestamp: Date;
  context: {
    batch?: number;
    page?: number;
    level?: string;
    wordId?: string;
  };
}

// Create context
export const NavigationStateContext = createContext<NavigationState | null>(null);

// Hook to use navigation context
export const useNavigationContext = () => {
  const context = useContext(NavigationStateContext);
  if (!context) {
    throw new Error('useNavigationContext must be used within a NavigationProvider');
  }
  return context;
};

// Navigation utility functions
export const buildContextualUrl = (
  baseUrl: string,
  context: {
    from?: string;
    batch?: number;
    page?: number;
    level?: string;
    isReview?: boolean;
    completed?: string;
  }
) => {
  const params = new URLSearchParams();
  
  if (context.from) params.set('from', context.from);
  if (context.batch) params.set('batch', context.batch.toString());
  if (context.page) params.set('page', context.page.toString());
  if (context.level) params.set('level', context.level);
  if (context.isReview) params.set('review', 'true');
  if (context.completed) params.set('completed', context.completed);
  
  return `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;
};

export const parseNavigationContext = (searchParams: URLSearchParams) => {
  return {
    from: searchParams.get('from') || '/dashboard',
    batch: searchParams.get('batch') ? parseInt(searchParams.get('batch')!) : undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
    level: searchParams.get('level') || undefined,
    isReview: searchParams.get('review') === 'true',
  };
};

// Session storage keys
export const NAVIGATION_STORAGE_KEYS = {
  CONTEXT: 'speechspark_navigation_context',
  HISTORY: 'speechspark_navigation_history',
  CURRENT_SESSION: 'speechspark_current_session',
} as const;

// Navigation helpers
export const saveNavigationContext = (context: NavigationContext) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(
      NAVIGATION_STORAGE_KEYS.CONTEXT,
      JSON.stringify(context)
    );
  }
};

export const loadNavigationContext = (): NavigationContext | null => {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(NAVIGATION_STORAGE_KEYS.CONTEXT);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.warn('Failed to parse navigation context:', error);
      }
    }
  }
  return null;
};

export const clearNavigationContext = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(NAVIGATION_STORAGE_KEYS.CONTEXT);
  }
};

// Default navigation context
export const defaultNavigationContext: NavigationContext = {
  currentBatch: 1,
  currentPage: 1,
  currentLevel: 'beginner',
  learningPath: [],
  completedWords: [],
  lastVisited: {
    dashboard: '/dashboard',
    word: '',
    batch: '',
  },
  returnPath: '/dashboard',
  batchInfo: {
    batch: 1,
    page: 1,
    totalPages: 1,
  },
};