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
import LearnAllWordsMessage from "@/components/LearnAllWordsMessage";
import LevelCircles from "@/components/LevelCircles";
import LevelMessage from "@/components/LevelMessage";
import DashboardLayout from "./dashboard/DashboardLayout";
import StatsCard from "./dashboard/StatsCard";
import { useApi } from "@/hooks/useApi";
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
}

interface Word {
  original: string;
  translation: string;
  learned: boolean;
}

const WORDS_PER_PAGE = 50;

const wordsPerLevel = {
  A1: 1000,
  A2: 2000,
  B1: 3000,
  B2: 4000,
  C1: 5000,
};

const getPagesForLevel = (level: string): number => {
  const totalWords = wordsPerLevel[level as keyof typeof wordsPerLevel] || 1000;
  return totalWords / WORDS_PER_PAGE;
};

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
  const [searchQuery, setSearchQuery] = useState("");

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
    proficiencyLevel: string;
  }>();
  // Data fetching functions
  const fetchUserData = useCallback(async () => {
    await userDataRequest("/api/user");
  }, [userDataRequest]);

  const fetchWords = useCallback(
    async (page: number, level?: string) => {
      await wordsRequest("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, pageSize: WORDS_PER_PAGE, level }),
      });
    },
    [wordsRequest]
  );

  const generateWords = useCallback(async () => {
    setIsGeneratingWords(true);
    setGenerationError(null);
    try {
      const response = await fetch("/api/words/generate", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate words");
      }

      if (data.generatedCount === 0) {
        setGenerationError(
          "No new words could be generated at this time. Please try again later."
        );
      } else {
        toast.custom(
          <CustomToast
            message={`Successfully generated ${data.generatedCount} new words!`}
          />,
          { duration: 4000, position: "bottom-center" }
        );
      }

      await fetchWords(currentPage);
      await fetchUserData();
    } catch (error) {
      console.error("Error generating words:", error);
      setGenerationError(
        "Failed to generate new words. Please try again later."
      );
    } finally {
      setIsGeneratingWords(false);
    }
  }, [currentPage, fetchWords, fetchUserData]);

    useEffect(() => {
      fetchUserData();

      // Listen for word learned events
      const handleWordLearned = () => {
        fetchUserData();
        fetchWords(currentPage);
      };

      window.addEventListener("wordLearned", handleWordLearned);

      return () => {
        window.removeEventListener("wordLearned", handleWordLearned);
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

  // Effect hooks
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (userDataResponse) {
      setUserData(userDataResponse);
      setTotalPages(getPagesForLevel(userDataResponse.proficiencyLevel));
      if (showLearnedWords) {
        fetchLearnedWords();
      } else {
        const level = searchParams.get("level");
        fetchWords(currentPage, level || undefined);
      }
    }
  }, [
    userDataResponse,
    currentPage,
    fetchWords,
    showLearnedWords,
    fetchLearnedWords,
    searchParams,
  ]);

  useEffect(() => {
    if (wordsData) {
      setWords(wordsData.words);
      setTotalPages(wordsData.totalPages);
      setProgress(wordsData.progress);
      setCurrentBatch(wordsData.currentBatch);
      setProficiencyLevel(wordsData.proficiencyLevel);

      if (wordsData.words.length < WORDS_PER_PAGE && !isGeneratingWords) {
        generateWords();
      }
    }
  }, [wordsData, generateWords, isGeneratingWords]);

  // Event handlers
  const handleNextPage = () => {
    const allLearned = words.every((word) => word.learned);
    if (allLearned) {
      if (currentPage < totalPages) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchWords(nextPage);
      } else {
        toast.success(
          "Congratulations! You've completed all words for this level."
        );
      }
    } else {
      setShowLearnAllMessage(true);
      setTimeout(() => setShowLearnAllMessage(false), 3000);
    }
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          value={7}
          subtitle="Days in a row"
          icon={Trophy}
          trend={{ value: 16, isPositive: true }}
        />
        <StatsCard
          title="Accuracy"
          value={`${Math.round(progressPercentage)}%`}
          subtitle="Overall progress"
          icon={Target}
          trend={{ value: 5, isPositive: true }}
        />
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
          <Button
            onClick={() => setShowLearnedWords(!showLearnedWords)}
            variant="outline"
            className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 rounded-xl px-6"
          >
            {showLearnedWords ? "Learn New Words" : "Review Learned Words"}
          </Button>
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

        {/* Words Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {wordsLoading || isGeneratingWords ? (
              <motion.div
                className="col-span-full flex justify-center items-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Zap className="w-10 h-10 text-primary animate-pulse" />
                <span className="ml-3 text-lg text-foreground/80">
                  Loading words...
                </span>
              </motion.div>
            ) : (
              filteredWords(showLearnedWords ? learnedWords : words).map(
                (word, index) => (
                  <motion.div
                    key={`${showLearnedWords ? "learned-" : ""}${index}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <WordCard
                      wordIndex={index}
                      original={word.original}
                      translation={word.translation}
                      learned={word.learned}
                      language={userData.learningLanguage}
                    />
                  </motion.div>
                )
              )
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {!showLearnedWords && words.length > 0 && (
          <div className="flex justify-between items-center mt-8 border-t border-foreground/10 pt-6">
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1 || wordsLoading || isGeneratingWords}
              className="bg-primary/10 hover:bg-primary/20 text-primary rounded-xl px-6"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <span className="text-sm text-foreground/80 bg-foreground/5 px-4 py-2 rounded-lg">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={handleNextPage}
              disabled={
                currentPage === totalPages || wordsLoading || isGeneratingWords
              }
              className="bg-primary/10 hover:bg-primary/20 text-primary rounded-xl px-6"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
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
        <LearnAllWordsMessage show={showLearnAllMessage} />
        <LevelMessage
          show={showLevelMessage}
          level={inaccessibleLevel}
          onClose={() => setShowLevelMessage(false)}
        />
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Dashboard;
