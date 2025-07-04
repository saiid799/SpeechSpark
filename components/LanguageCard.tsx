import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface Language {
  name: string;
  code: string;
  flag: string;
}

interface LanguageCardProps {
  language: Language;
  selected: boolean;
  onClick: () => void;
}

const LanguageCard: React.FC<LanguageCardProps> = ({
  language,
  selected,
  onClick,
}) => {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} layout>
      <Card
        className={`
          relative overflow-hidden cursor-pointer transition-all duration-300
          ${
            selected
              ? "bg-primary text-primary-foreground shadow-lg"
              : "bg-card hover:bg-primary/10 text-foreground"
          }
        `}
        onClick={onClick}
      >
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={language.flag}
            alt={`${language.name} flag`}
            fill
            className="object-cover"
          />
          <div
            className={`absolute inset-0 ${
              selected ? "bg-primary/40" : "bg-background/40"
            }`}
          />
        </div>
        <div className="p-3 text-center">
          <span 
            className="font-black text-sm font-display tracking-tight"
            style={{
              fontFamily: "'DM Sans', 'Inter', sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.015em"
            }}
          >
            {language.name}
          </span>
        </div>
        {selected && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-accent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
          />
        )}
      </Card>
    </motion.div>
  );
};

export default LanguageCard;
