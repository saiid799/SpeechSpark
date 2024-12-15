// File: components/LevelDetailsModal.tsx

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Book, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LevelDetailsModalProps {
  level: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Word {
  original: string;
  translation: string;
  learned: boolean;
}

const LevelDetailsModal: React.FC<LevelDetailsModalProps> = ({
  level,
  isOpen,
  onClose,
}) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevelWords = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/words/level/${level}`);
        if (!response.ok) throw new Error("Failed to fetch level words");
        const data = await response.json();
        setWords(data.words);
      } catch (error) {
        console.error("Error fetching level words:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchLevelWords();
    }
  }, [level, isOpen]);

  const learnedWordsCount = words.filter((word) => word.learned).length;
  const progressPercentage = (learnedWordsCount / words.length) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Level {level} Details
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Progress</h3>
                <Progress value={progressPercentage} className="h-2" />
                <p className="mt-2 text-sm text-gray-600">
                  {learnedWordsCount} out of {words.length} words learned
                </p>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[50vh]">
                  <h3 className="text-lg font-semibold mb-4">Words</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {words.map((word, index) => (
                      <div
                        key={index}
                        className="p-3 bg-card/50 rounded-lg shadow flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{word.original}</p>
                          <p className="text-sm text-gray-600">
                            {word.translation}
                          </p>
                        </div>
                        {word.learned ? (
                          <CheckCircle className="text-green-500" size={20} />
                        ) : (
                          <Book className="text-primary/50" size={20} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelDetailsModal;
