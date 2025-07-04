// File: app/learn/[id]/page.tsx

"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EnhancedWordExperience from "@/components/experience/EnhancedWordExperience";
import Breadcrumb from "@/components/navigation/Breadcrumb";
import { useApi } from "@/hooks/useApi";
import { motion } from "framer-motion";
import { Loader2, Home, BookOpen, Target, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseNavigationContext } from "@/lib/navigation-context";

interface Word {
  original: string;
  translation: string;
  learned: boolean;
}

interface User {
  learningLanguage: string;
  nativeLanguage: string;
}

export default function LearnPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [word, setWord] = useState<Word | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const resolvedParams = use(params);
  const navigationContext = parseNavigationContext(searchParams);

  const { request: fetchWord, data: wordData } = useApi<Word>();
  const { request: fetchUser, data: userData } = useApi<User>();

  useEffect(() => {
    fetchWord(`/api/words/${resolvedParams.id}`);
    fetchUser("/api/user");
  }, [resolvedParams.id, fetchWord, fetchUser]);

  useEffect(() => {
    if (wordData) setWord(wordData);
    if (userData) setUser(userData);
  }, [wordData, userData]);

  const handleComplete = async () => {
    // Build contextual return URL
    const returnUrl = new URL(navigationContext.from, window.location.origin);
    
    // Add completion context
    returnUrl.searchParams.set('completed', resolvedParams.id);
    if (navigationContext.batch) {
      returnUrl.searchParams.set('batch', navigationContext.batch.toString());
    }
    if (navigationContext.page) {
      returnUrl.searchParams.set('page', navigationContext.page.toString());
    }
    if (navigationContext.level) {
      returnUrl.searchParams.set('level', navigationContext.level);
    }
    
    // Emit completion event for dashboard refresh
    window.dispatchEvent(new CustomEvent('wordLearned', {
      detail: { 
        wordId: resolvedParams.id, 
        context: navigationContext 
      }
    }));
    
    router.push(returnUrl.pathname + returnUrl.search);
  };

  const handleBack = () => {
    router.push(navigationContext.from);
  };

  // Build breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    ...(navigationContext.level ? [{ label: `Level ${navigationContext.level}`, icon: Target }] : []),
    ...(navigationContext.batch ? [{ label: `Batch ${navigationContext.batch}`, icon: BookOpen }] : []),
    { label: word?.original || "Learning Word", isCurrentPage: true }
  ];

  if (!word || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-lg text-foreground/80">Loading your lesson...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/10">
      {/* Navigation Header */}
      <div className="p-4 bg-background/80 backdrop-blur-sm border-b border-foreground/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {navigationContext.isReview ? "Review Mode" : "Learning Mode"}
            </div>
          </div>
          
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Word Learning Experience */}
      <EnhancedWordExperience
        wordId={resolvedParams.id}
        original={word.original}
        translation={word.translation}
        learningLanguage={user.learningLanguage}
        nativeLanguage={user.nativeLanguage}
        onComplete={handleComplete}
      />
    </div>
  );
}
