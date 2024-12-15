"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  BookOpen,
  SortAsc,
  Grid,
  List,
  Filter,
  Dices,
  RefreshCw,
  CheckCircle2,
  XCircle,
  GraduationCap,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import WordCard from "@/components/WordCard";
import { useApi } from "@/hooks/useApi";
import { toast } from "react-hot-toast";

interface Word {
  original: string;
  translation: string;
  learned: boolean;
}

interface Stats {
  totalWords: number;
  learnedWords: number;
  progress: number;
}

const PAGE_SIZE = 50; // Match Zod validation limit

const Practice: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"original" | "learned" | "recent">(
    "original"
  );
  const [filterLearned, setFilterLearned] = useState<
    "all" | "learned" | "unlearned"
  >("all");
  const [stats, setStats] = useState<Stats>({
    totalWords: 0,
    learnedWords: 0,
    progress: 0,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: wordsData,
    request: fetchWords,
    isLoading,
  } = useApi<{
    words: Word[];
    currentPage: number;
    totalPages: number;
    progress: string;
    currentBatch: string;
  }>();

  useEffect(() => {
    fetchWords("/api/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: currentPage,
        pageSize: PAGE_SIZE,
        level: selectedLevel !== "all" ? selectedLevel : undefined,
      }),
    });
  }, [fetchWords, selectedLevel, currentPage]);

  useEffect(() => {
    if (wordsData?.words) {
      const learnedCount = wordsData.words.filter(
        (word) => word.learned
      ).length;
      setStats({
        totalWords: wordsData.words.length,
        learnedWords: learnedCount,
        progress: (learnedCount / wordsData.words.length) * 100,
      });
    }
  }, [wordsData?.words]);

  const handleGenerateWords = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/words/generate", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate words");
      }

      toast.success(`Generated ${data.generatedCount} new words!`);
      await fetchWords("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: 1, pageSize: PAGE_SIZE }),
      });
      setCurrentPage(1);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate new words"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredAndSortedWords = React.useMemo(() => {
    if (!wordsData?.words) return [];

    let filtered = [...wordsData.words];

    if (searchQuery) {
      filtered = filtered.filter(
        (word) =>
          word.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
          word.translation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterLearned === "learned") {
      filtered = filtered.filter((word) => word.learned);
    } else if (filterLearned === "unlearned") {
      filtered = filtered.filter((word) => !word.learned);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "learned":
          return a.learned === b.learned
            ? a.original.localeCompare(b.original)
            : a.learned
            ? -1
            : 1;
        case "recent":
          return -1; // In a real app, you'd use a timestamp
        default:
          return a.original.localeCompare(b.original);
      }
    });

    return filtered;
  }, [wordsData?.words, searchQuery, sortBy, filterLearned]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-background to-background/80 p-6 rounded-xl border border-foreground/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold">
              Practice{" "}
              <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                Current Words
              </span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Master your vocabulary through regular practice
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className={viewMode === "grid" ? "bg-primary/10" : ""}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4 mr-2" />
              Grid
            </Button>
            <Button
              variant="outline"
              className={viewMode === "list" ? "bg-primary/10" : ""}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant="outline"
              onClick={handleGenerateWords}
              disabled={isGenerating}
              className="bg-secondary/10 hover:bg-secondary/20"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Dices className="w-4 h-4 mr-2" />
              )}
              Generate Words
            </Button>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-primary/5">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Total Words</div>
                <div className="text-2xl font-bold">{stats.totalWords}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-green-500/5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">
                  Learned Words
                </div>
                <div className="text-2xl font-bold">{stats.learnedWords}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-secondary/5">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-secondary" />
              <div>
                <div className="text-sm text-muted-foreground">To Learn</div>
                <div className="text-2xl font-bold">
                  {stats.totalWords - stats.learnedWords}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-4">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(stats.progress)}%</span>
          </div>
          <Progress value={stats.progress} className="h-2" />
        </div>
      </div>

      {/* Filters Section */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={sortBy}
              onValueChange={(value: "original" | "learned" | "recent") =>
                setSortBy(value)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">By Name</SelectItem>
                <SelectItem value="learned">By Status</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterLearned}
              onValueChange={(value: "all" | "learned" | "unlearned") =>
                setFilterLearned(value)
              }
            >
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Words</SelectItem>
                <SelectItem value="learned">Learned Only</SelectItem>
                <SelectItem value="unlearned">Unlearned Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[140px]">
                <BookOpen className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="A1">Level A1</SelectItem>
                <SelectItem value="A2">Level A2</SelectItem>
                <SelectItem value="B1">Level B1</SelectItem>
                <SelectItem value="B2">Level B2</SelectItem>
                <SelectItem value="C1">Level C1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Words Grid/List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredAndSortedWords.map((word, index) => (
              <motion.div
                key={word.original}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <WordCard
                  wordIndex={index}
                  original={word.original}
                  translation={word.translation}
                  learned={word.learned}
                  language="English"
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {!isLoading && filteredAndSortedWords.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No words found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or generate new words
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Practice;
