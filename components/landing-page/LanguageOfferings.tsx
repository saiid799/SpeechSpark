// File: components/landing-page/LanguageOfferings.tsx

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { languages } from "@/lib/languageData";

const LanguageOfferings: React.FC = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [hoveredLanguage, setHoveredLanguage] = useState<string | null>(null);

  const handleStartJourney = useCallback(() => {
    router.push(isSignedIn ? "/dashboard" : "/sign-up");
  }, [isSignedIn, router]);

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/10">
      <BackgroundAnimation />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground font-display">
            Explore Our{" "}
            <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              Language Universe
            </span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Embark on a linguistic journey with SpeechSpark and master languages
            from around the globe.
          </p>
        </motion.div>

        <div className="relative mb-12">
          <LanguageCarousel onHover={setHoveredLanguage} />
        </div>

        <AnimatePresence>
          {hoveredLanguage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-center mb-8"
            >
              <p className="text-2xl font-semibold text-primary">
                {languages.find((lang) => lang.code === hoveredLanguage)?.name}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold transition-all duration-200 inline-flex items-center space-x-2 shadow-lg"
            onClick={handleStartJourney}
          >
            <span>{isSignedIn ? "Continue Your" : "Start Your"} Journey</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

const LanguageCarousel: React.FC<{
  onHover: (code: string | null) => void;
}> = ({ onHover }) => {
  return (
    <div className="flex overflow-hidden py-4">
      <motion.div
        className="flex space-x-6 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
      >
        {[...languages, ...languages].map((lang, index) => (
          <motion.div
            key={index}
            className="flex-shrink-0"
            whileHover={{ scale: 1.1, y: -5 }}
            onHoverStart={() => onHover(lang.code)}
            onHoverEnd={() => onHover(null)}
          >
            <Image
              src={lang.flag}
              alt={lang.name}
              width={60}
              height={40}
              className="rounded-lg shadow-md transition-all duration-200"
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const BackgroundAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 blur-3xl"
          style={{
            width: Math.random() * 400 + 200,
            height: Math.random() * 400 + 200,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            scale: [1, Math.random() + 0.5, 1],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
};

export default LanguageOfferings;
