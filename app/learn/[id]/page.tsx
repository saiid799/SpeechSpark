// File: app/learn/[id]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import WordLearningExperience from "@/components/experience/WordLearningExperience";
import { useApi } from "@/hooks/useApi";
import { motion } from "framer-motion";

interface Word {
  original: string;
  translation: string;
  learned: boolean;
}

interface User {
  learningLanguage: string;
  nativeLanguage: string;
}

export default function LearnPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [word, setWord] = useState<Word | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const isReview = searchParams.get("review") === "true";

  const { request: fetchWord, data: wordData } = useApi<Word>();
  const { request: fetchUser, data: userData } = useApi<User>();

  useEffect(() => {
    fetchWord(`/api/words/${params.id}`);
    fetchUser("/api/user");
  }, [params.id, fetchWord, fetchUser]);

  useEffect(() => {
    if (wordData) {
      setWord(wordData);
    }
    if (userData) {
      setUser(userData);
    }
  }, [wordData, userData]);

  const handleComplete = async () => {
    router.push("/dashboard");
  };

  if (!word || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-background to-primary/10 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-4xl">
        <WordLearningExperience
          wordIndex={parseInt(params.id)}
          original={word.original}
          translation={word.translation}
          learningLanguage={user.learningLanguage}
          nativeLanguage={user.nativeLanguage}
          onComplete={handleComplete}
          isReview={isReview}
        />
      </div>
    </motion.div>
  );
}
