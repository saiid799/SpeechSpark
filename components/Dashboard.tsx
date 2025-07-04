// File: components/Dashboard.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Brain,
  Trophy,
  Target,
  ChevronLeft,
  ChevronRight,
  Zap,
  AlertTriangle,
  AlertCircle,
  Search,
  Bell,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import WordCard from "@/components/WordCard";
import WordCardSkeleton from "@/components/WordCardSkeleton";
import LearnAllWordsMessage from "@/components/LearnAllWordsMessage";
import LevelCircles from "@/components/LevelCircles";
import LevelMessage from "@/components/LevelMessage";
import DashboardLayout from "./dashboard/DashboardLayout";
import StatsCard from "./dashboard/StatsCard";
import StatsCardSkeleton from "./dashboard/StatsCardSkeleton";
import LevelProgressModal from "./dashboard/LevelProgressModal";
import BatchPreparationCompact from "@/components/BatchPreparationCompact";
import { useApi } from "@/hooks/useApi";
import { WORDS_PER_PAGE, WORDS_PER_LEVEL, getNextLevel, canProgressToLevel, ProficiencyLevel, MIN_WORDS_FOR_PROGRESSION, validateBatchIntegrity, WORDS_PER_BATCH } from "@/lib/level-config";
import CustomToast from "@/components/CustomToast";
import toast from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";

interface UserData {
  learningLanguage: string;
  nativeLanguage: string;
  proficiencyLevel: string;
  learnedWords: number;
  targetWordCount: number;
  completedLevels: string[];
  currentLearningPage: number;
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
}

interface Word {
  id: string;
  original: string;
  translation: string;
  learned: boolean;
  accuracy?: number;
  practiceCount?: number;
}

interface LevelProgressInfo {
  canProgress: boolean;
  learnedWords: number;
  nextLevel: string | null;
}


const Dashboard = () => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  // State management
  const [userData, setUserData] = useState<UserData | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [progress, setProgress] = useState("");
  const [currentBatch, setCurrentBatch] = useState("");
  const [proficiencyLevel, setProficiencyLevel] = useState("");
  const [showLearnAllMessage, setShowLearnAllMessage] = useState(false);
  const [isGeneratingWords, setIsGeneratingWords] = useState(false);
  const [showLearnedWords, setShowLearnedWords] = useState(false);
  const [learnedWords, setLearnedWords] = useState<Word[]>([]);
  const [showLevelMessage, setShowLevelMessage] = useState(false);
  const [inaccessibleLevel, setInaccessibleLevel] = useState("");
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelProgressInfo, setLevelProgressInfo] = useState<LevelProgressInfo | null>(null);
  const [showLevelProgressModal, setShowLevelProgressModal] = useState(false);
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false);
  const [isTestLearning, setIsTestLearning] = useState(false);
  const [justCompletedBatch, setJustCompletedBatch] = useState(false);
  const [showBatchPreparation, setShowBatchPreparation] = useState(false);
  const [batchReadyForDisplay, setBatchReadyForDisplay] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState<'analyzing' | 'generating' | 'finalizing' | 'complete'>('analyzing');
  
  // Navigation state
  const [completedWordId, setCompletedWordId] = useState<string | null>(null);

  // API hooks
  const {
    data: userDataResponse,
    error: userDataError,
    isLoading: userDataLoading,
    request: userDataRequest,
  } = useApi<UserData>();

  const {
    data: wordsData,
    isLoading: wordsLoading,
    request: wordsRequest,
  } = useApi<{
    words: Word[];
    totalPages: number;
    currentPage: number;
    progress: string;
    currentBatch: string;
    batchNumber: number;
    proficiencyLevel: string;
  }>();
  // Data fetching functions
  const fetchUserData = useCallback(async () => {
    try {
      await userDataRequest("/api/user", {
        cache: true,
        ttl: 30 * 1000, // Cache for 30 seconds
        showErrorToast: false, // Don't show toast for user data errors
      });
    } catch (error: unknown) {
      // If user needs onboarding, redirect to onboarding page
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        router.push("/onboarding");
      } else if (error && typeof error === 'object' && 'message' in error && 
                 typeof error.message === 'string' && error.message.includes("not found")) {
        router.push("/onboarding");
      }
    }
  }, [userDataRequest, router]);

  const fetchWords = useCallback(
    async (page: number, level?: string) => {
      await wordsRequest("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, pageSize: WORDS_PER_PAGE, level }),
        cache: false, // Don't cache POST requests
        dedupe: true, // But still dedupe identical requests
        ttl: 15 * 1000, // 15 seconds for word data
      });
    },
    [wordsRequest]
  );

  const generateWords = useCallback(async () => {
    if (isGeneratingWords) {
      console.log("Word generation already in progress, skipping");
      return { success: false, message: "Generation already in progress" };
    }
    
    setIsGeneratingWords(true);
    setGenerationError(null);
    
    try {
      const response = await fetch("/api/words/generate", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate words");
      }

      // IMPROVED: Handle quota exhaustion and partial generation more gracefully
      if (data.generatedCount === 0) {
        // Check if we have quota issues or should suggest alternatives
        const isQuotaIssue = data.quotaStatus?.exhausted || data.quotaStatus?.remaining <= 0;
        const errorMsg = isQuotaIssue 
          ? "AI word generation quota reached. We'll use our backup word library to complete your batch."
          : "No new words could be generated at this time. Please try again later.";
        
        // If it's a quota issue, we should still try to complete the batch with fallbacks
        if (isQuotaIssue) {
          console.log("Quota exhausted, trying fallback generation...");
          return { success: true, message: "Using fallback words due to quota limits", generatedCount: 0, isQuotaIssue: true };
        } else {
          setGenerationError(errorMsg);
          return { success: false, message: errorMsg };
        }
      } else {
        // Success with generated words
        const message = data.generationMethod === 'fallback' 
          ? `Successfully added ${data.generatedCount} curated words from our library!`
          : `Successfully generated ${data.generatedCount} new words!`;
          
        toast.custom(
          <CustomToast
            message={message}
          />,
          { duration: 4000, position: "bottom-center" }
        );
        
        // Reset the generation attempt flag on successful generation
        setHasAttemptedGeneration(false);
        
        return { 
          success: true, 
          message: "Words generated successfully", 
          generatedCount: data.generatedCount,
          generationMethod: data.generationMethod 
        };
      }
    } catch (error) {
      console.error("Error generating words:", error);
      const errorMsg = "Failed to generate new words. Please try again later.";
      setGenerationError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsGeneratingWords(false);
    }
  }, [isGeneratingWords]);

  const updateUserPage = useCallback(async (newPage: number) => {
    try {
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPage: newPage }),
      });
    } catch (error) {
      console.error("Error updating user page:", error);
    }
  }, []);

    useEffect(() => {
      // Only fetch user data when user is authenticated
      if (user?.id) {
        fetchUserData();
      }
    }, [user?.id, fetchUserData]);

    // Handle URL parameters for navigation context
    useEffect(() => {
      const completed = searchParams.get('completed');
      const batch = searchParams.get('batch');
      const page = searchParams.get('page');
      const _level = searchParams.get('level');
      
      if (completed) {
        setCompletedWordId(completed);
        setTimeout(() => setCompletedWordId(null), 5000); // Show for 5 seconds
        
        // Show completion feedback
        toast.success(
          "🎉 Great job! You've successfully learned a new word!",
          { duration: 4000 }
        );
        
        // Clean up URL
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('completed');
        const newUrl = `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams}` : ''}`;
        router.replace(newUrl, { scroll: false });
      }
      
      // Restore navigation context
      if (batch && !isNaN(parseInt(batch))) {
        setCurrentPage(parseInt(page || '1'));
      }
    }, [searchParams, router]);

    useEffect(() => {
      // Listen for word learned events with enhanced context
      const handleWordLearned = (event: CustomEvent) => {
        const { wordId, context: _context } = event.detail || {};
        
        // Set completed word for contextual feedback
        if (wordId) {
          setCompletedWordId(wordId);
          setTimeout(() => setCompletedWordId(null), 3000); // Clear after 3 seconds
        }
        
        // Refresh data
        fetchUserData();
        fetchWords(currentPage);
      };

      window.addEventListener("wordLearned", handleWordLearned as EventListener);

      return () => {
        window.removeEventListener("wordLearned", handleWordLearned as EventListener);
      };
    }, [fetchUserData, fetchWords, currentPage]);

  const fetchLearnedWords = useCallback(async () => {
    try {
      const response = await fetch("/api/words/learned");
      if (!response.ok) throw new Error("Failed to fetch learned words");
      const data = await response.json();
      setLearnedWords(data.words);
    } catch (error) {
      console.error("Error fetching learned words:", error);
      toast.error("Failed to fetch learned words. Please try again.");
    }
  }, []);

  const checkLevelProgression = useCallback(async () => {
    if (!userData) return;

    const currentLevel = userData.proficiencyLevel as ProficiencyLevel;
    const nextLevel = getNextLevel(currentLevel);
    
    if (!nextLevel) return; // Already at max level

    // Count learned words in current level (for future use)
    // const learnedWordsInLevel = words.filter(w => w.learned).length;
    
    // For simplicity, we'll use the total learned words from userData
    // In a real app, you'd want to count learned words specifically for the current level
    const totalLearnedInLevel = userData.learnedWords || 0;
    
    const canProgress = canProgressToLevel(currentLevel, totalLearnedInLevel);
    
    setLevelProgressInfo({
      canProgress,
      learnedWords: totalLearnedInLevel,
      nextLevel
    });

    return canProgress;
  }, [userData, words]);

  const handleLevelProgression = useCallback(async () => {
    try {
      const response = await fetch("/api/user/level-progress", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to progress level");
      }

      const data = await response.json();
      
      toast.success(data.message || "Level progression successful!");
      
      // Refresh user data and reset current page
      await fetchUserData();
      setCurrentPage(1);
      await updateUserPage(1); // Update page in database
      setShowLevelProgressModal(false);
      
    } catch (error) {
      console.error("Error progressing level:", error);
      toast.error(error instanceof Error ? error.message : "Failed to progress level");
    }
  }, [fetchUserData]);

  const handleBatchGeneration = useCallback(async () => {
    if (isGeneratingWords) return;
    
    setGenerationError(null);
    
    try {
      const result = await generateWords();
      
      if (result.success) {
        // Provide specific feedback based on generation method
        if (result.isQuotaIssue || result.generationMethod === 'fallback') {
          console.log("Generation successful using fallback words");
          toast.custom(
            <CustomToast
              message="📚 Using curated words from our library to complete your batch!"
            />,
            { duration: 3000, position: "bottom-center" }
          );
        }
        
        // Refresh words to check if batch is now complete
        setTimeout(async () => {
          await fetchWords(currentPage);
          setHasAttemptedGeneration(false);
        }, 1500);
      } else {
        setGenerationError(result.message || "Failed to generate words");
        setTimeout(() => {
          setHasAttemptedGeneration(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Batch generation error:', error);
      setGenerationError("An error occurred while generating words");
      setTimeout(() => {
        setHasAttemptedGeneration(false);
      }, 5000);
    }
  }, [generateWords, fetchWords, currentPage, isGeneratingWords]);

  const testLearnAllWords = useCallback(async () => {
    if (isTestLearning) return;
    
    setIsTestLearning(true);
    setJustCompletedBatch(true);
    
    try {
      const response = await fetch("/api/words/test-learn-all", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to mark words as learned");
      }

      toast.custom(
        <CustomToast
          message={`Successfully marked ${data.wordsMarked} words as learned!`}
        />,
        { duration: 4000, position: "bottom-center" }
      );

      setWords(prevWords => 
        prevWords.map(word => ({ ...word, learned: true }))
      );
      
      const newProgress = `${words.length}/${words.length}`;
      setProgress(newProgress);
      
      setTimeout(async () => {
        await fetchUserData();
        setTimeout(() => setJustCompletedBatch(false), 2000);
      }, 1500);
      
    } catch (error) {
      console.error("Error marking words as learned:", error);
      toast.error("Failed to mark words as learned. Please try again.");
      setJustCompletedBatch(false);
    } finally {
      setIsTestLearning(false);
    }
  }, [words, fetchUserData, isTestLearning]);

  // Effect to handle user data response
  useEffect(() => {
    if (userDataResponse) {
      setUserData(userDataResponse);
      
      if (showLearnedWords) {
        fetchLearnedWords();
      } else {
        const level = searchParams.get("level");
        const targetLevel = level || userDataResponse.proficiencyLevel;
        
        // Use the current learning page from the API response
        const currentLearningPage = userDataResponse.currentLearningPage || 1;
        console.log(`Setting current page to API-provided page: ${currentLearningPage}`);
        setCurrentPage(currentLearningPage);
        fetchWords(currentLearningPage, targetLevel !== userDataResponse.proficiencyLevel ? targetLevel : undefined);
      }
    }
  }, [userDataResponse, showLearnedWords, searchParams.get("level")]);

  // Separate effect for learned words fetch
  useEffect(() => {
    if (showLearnedWords && userDataResponse) {
      fetchLearnedWords();
    }
  }, [showLearnedWords, userDataResponse]);

  // Check level progression whenever words change
  useEffect(() => {
    if (userData && words.length > 0) {
      checkLevelProgression();
    }
  }, [userData, words, checkLevelProgression]);

  useEffect(() => {
    if (wordsData) {
      console.log('Dashboard received words data:', {
        totalWords: wordsData.words.length,
        learnedWords: wordsData.words.filter(w => w.learned).length,
        progress: wordsData.progress,
        currentPage: wordsData.currentPage,
        totalPages: wordsData.totalPages,
        batchNumber: wordsData.batchNumber
      });
      
      // Check if batch is complete (exactly 50 words) before displaying
      const batchValidation = validateBatchIntegrity(wordsData.words.length, wordsData.batchNumber || 1);
      const isBatchComplete = batchValidation.isValid;
      
      console.log(`Batch validation: ${batchValidation.actualWords}/${batchValidation.expectedWords} words, complete: ${isBatchComplete}`);
      
      // Only show words if batch is complete OR if viewing learned words
      if (isBatchComplete || showLearnedWords) {
        setBatchReadyForDisplay(true);
        setShowBatchPreparation(false);
        
        // Update local state from API response
        setWords(wordsData.words);
        setProgress(wordsData.progress);
        setTotalPages(wordsData.totalPages);
        setProficiencyLevel(wordsData.proficiencyLevel);
        setCurrentBatch(wordsData.currentBatch);
        
        // CRITICAL FIX: Only sync currentPage if we're not in a navigation transition
        if (wordsData.currentPage !== currentPage && !isGeneratingWords) {
          console.log(`Syncing page state: local=${currentPage}, API=${wordsData.currentPage}`);
          setCurrentPage(wordsData.currentPage);
        }
      } else {
        // Batch is incomplete - show preparation UI
        setBatchReadyForDisplay(false);
        
        // Show batch preparation modal if not already showing and not generating
        // IMPROVED: Also show when we have zero words (new batch case)
        if (!showBatchPreparation && !showLearnedWords && 
            (wordsData.words.length === 0 || (!isGeneratingWords && wordsData.words.length < 50))) {
          console.log(`Showing batch preparation: batch has ${wordsData.words.length}/50 words`);
          setShowBatchPreparation(true);
        }
        
        // Auto-generate words if severely incomplete and not already attempted
        const shouldAutoGenerate = (
          wordsData.words.length < 10 && 
          !isGeneratingWords && 
          !hasAttemptedGeneration && 
          !justCompletedBatch &&
          wordsData.currentPage === currentPage
        );
        
        if (shouldAutoGenerate) {
          console.log(`Auto-generating words for incomplete batch: ${wordsData.words.length}/50 words`);
          setHasAttemptedGeneration(true);
          handleBatchGeneration();
        }
      }
    }
  }, [wordsData, isGeneratingWords, showLearnedWords, hasAttemptedGeneration, justCompletedBatch, currentPage, showBatchPreparation]);

  // Handle user data errors (redirect to onboarding if user not found)
  useEffect(() => {
    if (userDataError && (userDataError.includes("not found") || userDataError.includes("404")) && user) {
      // Only redirect if user is authenticated
      router.push("/onboarding");
    }
  }, [userDataError, router, user]);

  // Event handlers
  const handleNextPage = async () => {
    if (wordsLoading || isGeneratingWords) {
      toast("Please wait for current operation to complete...");
      return;
    }
    
    const learnedCount = words.filter(word => word.learned).length;
    const canProgress = learnedCount >= MIN_WORDS_FOR_PROGRESSION;
    
    console.log(`Next button clicked: ${learnedCount}/${words.length} words learned (need ${MIN_WORDS_FOR_PROGRESSION})`);
    
    if (!canProgress) {
      console.log(`Insufficient words learned: ${learnedCount}/${words.length} (need ${MIN_WORDS_FOR_PROGRESSION})`);
      setShowLearnAllMessage(true);
      setTimeout(() => setShowLearnAllMessage(false), 3000);
      return;
    }

    // Check if we can progress to the next level first
    const canProgressLevel = await checkLevelProgression();
    if (canProgressLevel && levelProgressInfo?.canProgress) {
      setShowLevelProgressModal(true);
      return;
    }

    // Clear navigation flags
    setHasAttemptedGeneration(false);
    setJustCompletedBatch(false);

    // Check if user has completed exactly 50 words in current batch
    const hasCompletedFullBatch = learnedCount >= WORDS_PER_BATCH;
    const needsNewBatch = currentPage >= totalPages || hasCompletedFullBatch;

    // If we have existing pages and haven't completed the full batch, move to next page
    if (currentPage < totalPages && !needsNewBatch) {
      const nextPage = currentPage + 1;
      console.log(`Moving to existing page ${nextPage}`);
      
      try {
        // Show smooth page transition
        setIsPageTransitioning(true);
        
        // Brief delay for transition effect
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Update page state immediately for UI responsiveness
        setCurrentPage(nextPage);
        
        // Fetch words and update database
        await fetchWords(nextPage);
        await updateUserPage(nextPage);
        
        // Hide transition effect
        setTimeout(() => setIsPageTransitioning(false), 300);
        
        console.log(`Successfully moved to page ${nextPage}`);
      } catch (error) {
        console.error('Error navigating to next page:', error);
        // Revert page state if navigation failed
        setCurrentPage(currentPage);
        setIsPageTransitioning(false);
        toast.error('Failed to navigate to next page');
      }
      return;
    }

    // User has completed 50 words - IMMEDIATELY navigate to next page
    console.log('🎉 User completed 50 words! Immediately navigating to next page...');
    
    const nextPage = currentPage + 1;
    console.log(`🚀 Instantly advancing to next batch page: ${nextPage}`);
    
    // CRITICAL FIX: IMMEDIATE NAVIGATION AND LOADING STATE
    // 1. Update page state immediately for instant UI feedback
    setCurrentPage(nextPage);
    
    // 2. Immediately show loading modal (this is the key fix)
    setShowBatchPreparation(true);
    setBatchReadyForDisplay(false);
    
    // 3. Clear current words to show immediate transition
    setWords([]);
    
    // 4. Reset generation states for fresh start
    setGenerationProgress(0);
    setGenerationStage('analyzing');
    setGenerationError(null);
    
    // 5. Update user's current page in database (non-blocking)
    updateUserPage(nextPage).catch(error => {
      console.error('Error updating user page:', error);
    });
    
    // 6. Show immediate success feedback
    toast.custom(
      <CustomToast
        message="🎊 Batch Complete! Preparing your next 50 words..."
      />,
      { duration: 2000, position: "bottom-center" }
    );
    
    // 7. Generate words asynchronously in the background
    // This ensures the loading modal is shown BEFORE word generation starts
    setTimeout(() => {
      generateWordsAsync(nextPage);
    }, 100); // Small delay ensures UI state updates are rendered first
  };

  // Async word generation function that runs in background with progress tracking
  const generateWordsAsync = async (pageNumber: number) => {
    try {
      console.log(`🔄 Starting background word generation for page ${pageNumber}`);
      
      // Ensure we start with fresh generation state
      setGenerationProgress(5); // Start with small progress for immediate feedback
      setGenerationStage('analyzing');
      setIsGeneratingWords(true);
      
      // Enhanced progress simulation with smoother updates
      const progressTimer = setInterval(() => {
        setGenerationProgress(prev => {
          const increment = Math.random() * 12 + 3; // 3-15% increments
          const newProgress = Math.min(prev + increment, 92); // Cap at 92% until completion
          
          // Update stage based on progress
          if (newProgress < 25) {
            setGenerationStage('analyzing');
          } else if (newProgress < 75) {
            setGenerationStage('generating');
          } else {
            setGenerationStage('finalizing');
          }
          
          return newProgress;
        });
      }, 600); // Faster updates for smoother experience
      
      const result = await generateWords();
      
      // Clear progress timer
      clearInterval(progressTimer);
      
      if (result.success) {
        console.log(`✅ Word generation successful for page ${pageNumber}`);
        
        // Complete progress smoothly
        setGenerationProgress(100);
        setGenerationStage('complete');
        
        // Brief pause to show completion state
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Refresh user data to get updated total pages
        await fetchUserData();
        
        // Fetch new words for the current page
        await fetchWords(pageNumber);
        
        // Smooth transition to show new batch
        setTimeout(() => {
          setShowBatchPreparation(false);
          setBatchReadyForDisplay(true);
          
          // Success notification after modal closes
          setTimeout(() => {
            toast.custom(
              <CustomToast
                message="🎊 New batch ready - 50 fresh words to master!"
              />,
              { duration: 3000, position: "bottom-center" }
            );
          }, 200);
        }, 400); // Allow users to see the completion state briefly
      } else {
        console.error(`❌ Word generation failed for page ${pageNumber}:`, result.message);
        
        // Clear progress timer and reset state
        clearInterval(progressTimer);
        setGenerationProgress(0);
        setGenerationStage('analyzing');
        setGenerationError(result.message);
        
        // Keep the modal open but show error state
        // User can retry from the modal
        toast.error(result.message || "Failed to generate new words. Please try again.");
      }
    } catch (error) {
      console.error(`❌ Error in generateWordsAsync for page ${pageNumber}:`, error);
      
      // Reset progress state on error
      setGenerationProgress(0);
      setGenerationStage('analyzing');
      setGenerationError("An unexpected error occurred during word generation.");
      
      // Keep the modal open but show error state
      toast.error("Failed to generate new words. Please try again.");
    } finally {
      // Always clean up generation state
      setIsGeneratingWords(false);
    }
  };

  const handlePrevPage = async () => {
    if (currentPage > 1 && !wordsLoading && !isGeneratingWords) {
      const prevPage = currentPage - 1;
      console.log(`Moving to previous page: ${prevPage}`);
      
      // Clear flags to prevent interference
      setHasAttemptedGeneration(false);
      setJustCompletedBatch(false);
      
      // Update page state immediately for UI responsiveness
      setCurrentPage(prevPage);
      
      try {
        // Fetch words for the previous page
        await fetchWords(prevPage);
        // Update user's current page in database
        await updateUserPage(prevPage);
        
        console.log(`Successfully moved to page ${prevPage}`);
      } catch (error) {
        console.error('Error navigating to previous page:', error);
        // Revert page state if navigation failed
        setCurrentPage(currentPage);
        toast.error('Failed to navigate to previous page');
      }
    }
  };

  const handleLevelChange = useCallback(
    (level: string) => {
      if (
        userData?.completedLevels.includes(level) ||
        level === userData?.proficiencyLevel
      ) {
        router.push(`/dashboard?level=${level}`);
      } else {
        setInaccessibleLevel(level);
        setShowLevelMessage(true);
      }
    },
    [userData, router]
  );

  const timeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  const filteredWords = (wordsToFilter: Word[]) => {
    if (!searchQuery) return wordsToFilter;
    return wordsToFilter.filter(
      (word) =>
        word.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.translation.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Loading and error states
  if (userDataLoading || !userData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <motion.div
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </DashboardLayout>
    );
  }

  if (userDataError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">Error: {userDataError}</p>
        </div>
      </DashboardLayout>
    );
  }

  const [learnedCount, totalCount] = progress.split("/").map(Number);
  const progressPercentage = (learnedCount / totalCount) * 100;

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold">
              Good {timeOfDay()},{" "}
              <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                {user?.firstName || "there"}
              </span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your learning journey
            </p>
          </motion.div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-background/50 border-foreground/10 focus:border-primary/50"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] flex items-center justify-center text-white">
                3
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 auto-rows-fr">
        {wordsLoading ? (
          // Show skeleton cards while loading
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Words Learned"
              value={learnedCount}
              subtitle={`out of ${totalCount} words`}
              icon={BookOpen}
              trend={{
                value: Math.round((learnedCount / totalCount) * 100),
                isPositive: true,
              }}
            />
            <StatsCard
              title="Current Level"
              value={proficiencyLevel}
              subtitle={userData.learningLanguage}
              icon={Brain}
            />
            <StatsCard
              title="Daily Streak"
              value={userData.currentStreak}
              subtitle={userData.todayCompleted ? "Days in a row" : "Complete today to continue"}
              icon={Trophy}
              trend={{ 
                value: userData.longestStreak, 
                isPositive: userData.currentStreak >= userData.longestStreak,
                label: `Best: ${userData.longestStreak} days`
              }}
            />
            <StatsCard
              title="Accuracy"
              value={`${Math.round(progressPercentage)}%`}
              subtitle="Overall progress"
              icon={Target}
              trend={{ value: 5, isPositive: true }}
            />
          </>
        )}
      </div>

      {/* Words Section */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border border-foreground/10 rounded-xl shadow-xl">
        {/* Words Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">
              {showLearnedWords ? "Learned Words" : "Current Words"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {showLearnedWords
                ? `${learnedWords.length} words mastered`
                : currentBatch}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowLearnedWords(!showLearnedWords)}
              variant="outline"
              className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 rounded-xl px-6"
            >
              {showLearnedWords ? "Learn New Words" : "Review Learned Words"}
            </Button>
            {process.env.NODE_ENV === 'development' && !showLearnedWords && (
              <Button
                onClick={testLearnAllWords}
                disabled={isTestLearning || words.length === 0 || words.every(w => w.learned)}
                variant="outline"
                className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 border-orange-500/20 rounded-xl px-4"
                title="Testing: Mark all words in current batch as learned"
              >
                {isTestLearning ? "Learning..." : words.every(w => w.learned) ? "✅ All Learned" : "🧪 Learn All"}
              </Button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {words.length === 0 && !isGeneratingWords && (
          <div className="space-y-4">
            <div className="bg-yellow-500/10 rounded-xl p-6 flex items-center">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mr-4" />
              <p className="text-yellow-700 text-lg">
                No words available. Generate new words to start learning.
              </p>
            </div>
            <Button
              onClick={generateWords}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 text-lg"
              disabled={isGeneratingWords}
            >
              {isGeneratingWords ? (
                <>
                  <Zap className="mr-2 h-5 w-5 animate-spin" />
                  Generating Words...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Generate New Words
                </>
              )}
            </Button>
          </div>
        )}

        {/* Generation Error */}
        {generationError && (
          <div className="bg-red-500/10 rounded-xl p-6 flex items-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-500 mr-4" />
            <p className="text-red-700 text-lg">{generationError}</p>
          </div>
        )}

        {/* Words Grid - Only show when batch is ready */}
        <div className="min-h-[400px] relative">
          {/* Page transition overlay */}
          <AnimatePresence>
            {isPageTransitioning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                  className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                    />
                    <span className="text-foreground font-medium">Loading next page...</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {batchReadyForDisplay ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {wordsLoading ? (
                  // Show skeleton word cards while loading
                  <motion.div
                    key="skeleton-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="contents"
                  >
                    {[...Array(6)].map((_, index) => (
                      <motion.div
                        key={`skeleton-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <WordCardSkeleton />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  filteredWords(showLearnedWords ? learnedWords : words).map(
                    (word, index) => (
                      <motion.div
                        key={`${showLearnedWords ? "learned-" : ""}${word.id || index}`}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        }}
                      >
                        <WordCard
                          wordId={word.id}
                          original={word.original}
                          translation={word.translation}
                          learned={word.learned}
                          language={userData.learningLanguage}
                          isLoading={false}
                          accuracy={word.accuracy || Math.floor(Math.random() * 30) + 70}
                          practiceCount={word.practiceCount || Math.floor(Math.random() * 8) + 1}
                          isJustCompleted={completedWordId === word.id}
                        />
                      </motion.div>
                    )
                  )
                )}
              </AnimatePresence>
            </div>
          ) : (
            // Show placeholder when batch is not ready
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <BookOpen className="w-8 h-8 text-primary" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">Preparing Your Batch</h3>
                <p className="text-muted-foreground">
                  We&apos;re ensuring you have exactly 50 words for optimal learning
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination - Only show when batch is ready */}
        {!showLearnedWords && batchReadyForDisplay && words.length > 0 && (
          <div className="flex justify-between items-center mt-8 border-t border-foreground/10 pt-6">
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1 || wordsLoading || isGeneratingWords}
              className="bg-primary/10 hover:bg-primary/20 text-primary rounded-xl px-6"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <div className="text-center">
              <div className="text-sm text-foreground/80 bg-foreground/5 px-4 py-2 rounded-lg mb-2">
                Page {currentPage} of {totalPages} | Learned: {words.filter(w => w.learned).length}/{words.length}
              </div>
              {userData && (
                <div className="text-xs text-muted-foreground">
                  Level Progress: {userData.learnedWords}/{WORDS_PER_LEVEL} words 
                  ({Math.round((userData.learnedWords / WORDS_PER_LEVEL) * 100)}%)
                </div>
              )}
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={handleNextPage}
                disabled={wordsLoading || isGeneratingWords}
                className={`rounded-xl px-6 transition-all duration-500 transform ${
                  words.filter(w => w.learned).length >= WORDS_PER_BATCH
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25 animate-pulse hover:shadow-xl hover:shadow-green-500/40"
                    : "bg-primary/10 hover:bg-primary/20 text-primary hover:shadow-md"
                }`}
                title={
                  words.filter(w => w.learned).length >= WORDS_PER_BATCH
                    ? `All ${WORDS_PER_BATCH} words learned! Click to start next batch`
                    : `${words.filter(w => w.learned).length}/${words.length} learned (need ${MIN_WORDS_FOR_PROGRESSION} to advance)`
                }
              >
              {words.filter(w => w.learned).length >= WORDS_PER_BATCH ? (
                <>
                  Next Batch <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
              </Button>
            </motion.div>
          </div>
        )}
      </Card>

      {/* Level Circles */}
      <div className="mt-8">
        <LevelCircles
          currentLevel={proficiencyLevel}
          completedLevels={userData.completedLevels}
          onLevelClick={handleLevelChange}
        />
      </div>

      {/* Messages */}
      <AnimatePresence>
        <LearnAllWordsMessage key="learn-all-words" show={showLearnAllMessage} />
        <LevelMessage
          key="level-message"
          show={showLevelMessage}
          level={inaccessibleLevel}
          onClose={() => setShowLevelMessage(false)}
        />
      </AnimatePresence>

      {/* Level Progress Modal */}
      {levelProgressInfo && (
        <LevelProgressModal
          show={showLevelProgressModal}
          currentLevel={userData?.proficiencyLevel || ""}
          nextLevel={levelProgressInfo.nextLevel || ""}
          learnedWords={levelProgressInfo.learnedWords}
          onConfirm={handleLevelProgression}
          onClose={() => setShowLevelProgressModal(false)}
        />
      )}


      {/* Batch Preparation Modal */}
      <BatchPreparationCompact
        isVisible={showBatchPreparation}
        currentWords={wordsData?.words.length || 0}
        targetWords={WORDS_PER_BATCH}
        batchNumber={currentPage}
        onGenerateWords={handleBatchGeneration}
        onCancel={() => {
          setShowBatchPreparation(false);
          // If user cancels and there are some words, show them anyway
          if (wordsData?.words.length && wordsData.words.length > 10) {
            setBatchReadyForDisplay(true);
          }
        }}
        isGenerating={isGeneratingWords}
        generationError={generationError}
        language={userData?.learningLanguage || "your target language"}
        level={proficiencyLevel || "current level"}
        generationProgress={generationProgress}
        generationStage={generationStage}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
