// File: components/LearnedWordsGrid.tsx

import React from "react";
import WordCard from "@/components/WordCard";

interface LearnedWordsGridProps {
  words: string[];
  language: string;
}

const LearnedWordsGrid: React.FC<LearnedWordsGridProps> = ({
  words,
  language,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {words.map((word, index) => (
        <WordCard
          key={index}
          wordId={`learned-${index}`}
          original={word}
          translation=""
          learned={true}
          language={language}
        />
      ))}
    </div>
  );
};

export default LearnedWordsGrid;
