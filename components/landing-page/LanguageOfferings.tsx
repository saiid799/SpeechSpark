// File: components/landing-page/LanguageOfferings.tsx

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { languages } from "@/lib/languageData";

// Duplicate languages array for infinite scroll
const extendedLanguages = [...languages, ...languages, ...languages];

const AnimatedFlags: React.FC<{
  languages: typeof languages;
  onClick: (lang: string) => void;
  selectedLanguage: string | null;
}> = ({ languages, onClick, selectedLanguage }) => (
  <div className="relative w-full overflow-hidden py-8">
    <motion.div
      className="flex gap-8"
      animate={{
        x: [-50 * languages.length, 0],
      }}
      transition={{
        duration: 50,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {languages.map((lang, idx) => (
        <motion.div
          key={`${lang.code}-${idx}`}
          className="relative w-[400px] flex-shrink-0"
          whileHover={{ scale: 1.05, y: -10 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          <motion.div
            className={`
              relative aspect-video rounded-2xl overflow-hidden cursor-pointer
              group transition-all duration-500 shadow-lg hover:shadow-xl
              ${
                selectedLanguage === lang.code
                  ? "ring-2 ring-primary shadow-lg shadow-primary/20"
                  : "hover:ring-1 hover:ring-primary/30"
              }
            `}
            onClick={() => onClick(lang.code)}
            layoutId={`flag-${lang.code}-${idx}`}
          >
            <Image
              src={lang.flag}
              alt={`${lang.name} flag`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20" />
              <motion.div
                className="absolute inset-0 bg-shimmer"
                animate={{
                  opacity: [0, 0.2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-white text-2xl font-medium">{lang.name}</p>
              </motion.div>
            </div>

            <div className="absolute inset-0 shine-effect opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  </div>
);

const LanguageOfferings: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/10">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-gradient-circles opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/5 mb-8 group"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Globe className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform duration-300" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-display">
            Choose Your{" "}
            <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              Language Path
            </span>
          </h2>

          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Begin your journey to fluency with our AI-powered learning
            experience
          </p>
        </motion.div>

        <div className="mt-12">
          <AnimatedFlags
            languages={extendedLanguages}
            onClick={(code) => setSelectedLanguage(code)}
            selectedLanguage={selectedLanguage}
          />
        </div>
      </div>
    </section>
  );
};

export default LanguageOfferings;
