// File: components/landing-page/Hero.tsx

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, Globe, Zap, BookOpen } from "lucide-react";

const Hero: React.FC = () => {
  const { isSignedIn, user } = useUser();

  const handleExploreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const howItWorksSection = document.getElementById("how-it-works");
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative overflow-hidden bg-background min-h-screen flex items-center pt-16 sm:pt-24 md:pt-32">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-3xl" />
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-secondary/5 to-transparent" />
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.h1
            className="mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground font-display"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {isSignedIn ? (
              <>
                Welcome back,
                <br />
                <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                  {user?.firstName || "Language Learner"}!
                </span>
              </>
            ) : (
              <>
                Revolutionize Your
                <br />
                <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                  Language Learning
                </span>
              </>
            )}
          </motion.h1>
          <motion.p
            className="mx-auto mb-10 max-w-2xl text-lg sm:text-xl md:text-2xl text-foreground/80"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {isSignedIn
              ? "Dive into your personalized learning journey with AI-powered lessons, interactive practice, and real-time progress tracking."
              : "Experience the future of language acquisition with SpeechSpark's cutting-edge AI technology, tailored lessons, and immersive practice sessions."}
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {isSignedIn ? (
              <>
                <Link href="/dashboard">
                  <HeroButton variant="primary">
                    Continue Learning <ArrowRight className="ml-2 h-5 w-5" />
                  </HeroButton>
                </Link>
                <Link href="/dashboard?showLearned=true">
                  <HeroButton variant="secondary">
                    Review Learned Words <BookOpen className="ml-2 h-5 w-5" />
                  </HeroButton>
                </Link>
              </>
            ) : (
              <>
                <Link href="/sign-up">
                  <HeroButton variant="primary">
                    Start Your Journey <Zap className="ml-2 h-5 w-5" />
                  </HeroButton>
                </Link>
                <a href="#how-it-works" onClick={handleExploreClick}>
                  <HeroButton variant="secondary">
                    Explore Features <BookOpen className="ml-2 h-5 w-5" />
                  </HeroButton>
                </a>
              </>
            )}
          </motion.div>
          <motion.div
            className="mt-16 flex flex-wrap justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {[
              "English",
              "Spanish",
              "Japanese",
              "Chinese",
              "Arabic",
              "Portuguese",
            ].map((language, index) => (
              <motion.div
                key={language}
                className="flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(var(--primary) / 0.2)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
              >
                <Globe className="mr-2 h-4 w-4" />
                {language}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
      <BackgroundAnimation />
    </div>
  );
};

const HeroButton: React.FC<{
  variant: "primary" | "secondary";
  children: React.ReactNode;
}> = ({ variant, children }) => (
  <motion.button
    className={`px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 flex items-center ${
      variant === "primary"
        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl"
        : "bg-secondary/10 text-secondary hover:bg-secondary/20 border border-secondary/20 hover:border-secondary/40"
    }`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {children}
  </motion.button>
);

const BackgroundAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-1/2 -left-1/2 w-full h-full">
        <motion.div
          className="w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      <div className="absolute -bottom-1/2 -right-1/2 w-full h-full">
        <motion.div
          className="w-full h-full bg-gradient-to-tl from-secondary/20 to-transparent rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -120, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </div>
  );
};

export default Hero;
