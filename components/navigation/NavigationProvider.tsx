// File: components/navigation/NavigationProvider.tsx

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  NavigationContext,
  NavigationState,
  NavigationItem,
  NavigationStateContext,
  defaultNavigationContext,
  buildContextualUrl,
  saveNavigationContext,
  loadNavigationContext,
  NAVIGATION_STORAGE_KEYS,
} from '@/lib/navigation-context';

interface NavigationProviderProps {
  children: React.ReactNode;
}

const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [context, setContext] = useState<NavigationContext>(defaultNavigationContext);
  const [history, setHistory] = useState<NavigationItem[]>([]);

  // Load navigation context from session storage on mount
  useEffect(() => {
    const savedContext = loadNavigationContext();
    if (savedContext) {
      setContext(savedContext);
    }

    // Load navigation history
    const savedHistory = sessionStorage.getItem(NAVIGATION_STORAGE_KEYS.HISTORY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.warn('Failed to parse navigation history:', error);
      }
    }
  }, []);

  // Save context to session storage whenever it changes
  useEffect(() => {
    saveNavigationContext(context);
  }, [context]);

  // Update context from URL parameters
  useEffect(() => {
    const from = searchParams.get('from');
    const batch = searchParams.get('batch');
    const page = searchParams.get('page');
    const level = searchParams.get('level');

    if (from || batch || page || level) {
      setContext(prev => ({
        ...prev,
        ...(from && { returnPath: from }),
        ...(batch && { currentBatch: parseInt(batch) }),
        ...(page && { currentPage: parseInt(page) }),
        ...(level && { currentLevel: level }),
        batchInfo: {
          ...prev.batchInfo,
          ...(batch && { batch: parseInt(batch) }),
          ...(page && { page: parseInt(page) }),
        },
      }));
    }
  }, [searchParams]);

  const updateContext = useCallback((updates: Partial<NavigationContext>) => {
    setContext(prev => ({ ...prev, ...updates }));
  }, []);

  const buildWordUrl = useCallback((wordId: string, options: {
    batch?: number;
    page?: number;
    level?: string;
    isReview?: boolean;
  } = {}) => {
    return buildContextualUrl(`/learn/${wordId}`, {
      from: '/dashboard',
      batch: options.batch || context.currentBatch,
      page: options.page || context.currentPage,
      level: options.level || context.currentLevel,
      isReview: options.isReview,
    });
  }, [context]);

  const buildReturnUrl = useCallback((fromWord: string, options: {
    batch?: number;
    page?: number;
    level?: string;
  } = {}) => {
    return buildContextualUrl('/dashboard', {
      completed: fromWord,
      batch: options.batch || context.currentBatch,
      page: options.page || context.currentPage,
      level: options.level || context.currentLevel,
    });
  }, [context]);

  const getNavigationHistory = useCallback(() => {
    return history.slice(-10); // Return last 10 items
  }, [history]);

  const addToHistory = useCallback((item: NavigationItem) => {
    setHistory(prev => {
      const newHistory = [...prev, item];
      // Keep only last 20 items
      if (newHistory.length > 20) {
        newHistory.splice(0, newHistory.length - 20);
      }
      
      // Save to session storage
      sessionStorage.setItem(
        NAVIGATION_STORAGE_KEYS.HISTORY,
        JSON.stringify(newHistory)
      );
      
      return newHistory;
    });
  }, []);

  const navigationState: NavigationState = {
    context,
    updateContext,
    buildWordUrl,
    buildReturnUrl,
    getNavigationHistory,
    addToHistory,
  };

  return (
    <NavigationStateContext.Provider value={navigationState}>
      {children}
    </NavigationStateContext.Provider>
  );
};

export default NavigationProvider;