// File: app/learn/[id]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EnhancedWordExperience from "@/components/experience/EnhancedWordExperience";
import { useApi } from "@/hooks/useApi";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

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
  const [word, setWord] = useState<Word | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const { request: fetchWord, data: wordData } = useApi<Word>();
  const { request: fetchUser, data: userData } = useApi<User>();

  useEffect(() => {
    fetchWord(`/api/words/${params.id}`);
    fetchUser("/api/user");
  }, [params.id, fetchWord, fetchUser]);

  useEffect(() => {
    if (wordData) setWord(wordData);
    if (userData) setUser(userData);
  }, [wordData, userData]);

  const handleComplete = async () => {
    router.push("/dashboard");
  };

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
    <EnhancedWordExperience
      wordIndex={parseInt(params.id)}
      original={word.original}
      translation={word.translation}
      learningLanguage={user.learningLanguage}
      nativeLanguage={user.nativeLanguage}
      onComplete={handleComplete}
    />
  );
}
