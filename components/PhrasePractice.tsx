// File: components/experience/PhrasePractice.tsx

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useApi } from "@/hooks/useApi";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import {
  Check,
  X,
  Volume2,
  ArrowRight,
  Headphones,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface Phrase {
  original: string;
  translation: string;
}

interface PhrasePracticeProps {
  word: string;
  learningLanguage: string;
  nativeLanguage: string;
  onComplete: () => void;
}

const PhrasePractice: React.FC<PhrasePracticeProps> = ({
  word,
  learningLanguage,
  nativeLanguage,
  onComplete,
}) => {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean | null;
    message: string;
  }>({ isCorrect: null, message: "" });
  const [showTranslation, setShowTranslation] = useState(false);
  const [progress, setProgress] = useState(0);

  const { speak, speaking } = useSpeechSynthesis();
  const {
    request: fetchPhrases,
    data: phrasesData,
    isLoading,
    error,
  } = useApi<Phrase[]>();

  useEffect(() => {
    fetchPhrases(`/api/words/${encodeURIComponent(word)}/phrases`);
  }, [word, fetchPhrases]);

  useEffect(() => {
    if (phrasesData) {
      setPhrases(phrasesData);
    }
  }, [phrasesData]);

  useEffect(() => {
    setProgress((currentPhraseIndex / phrases.length) * 100);
  }, [currentPhraseIndex, phrases.length]);

  const handleSubmit = useCallback(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    const isAnswerCorrect =
      userInput.toLowerCase().trim() ===
      currentPhrase.original.toLowerCase().trim();

    setFeedback({
      isCorrect: isAnswerCorrect,
      message: isAnswerCorrect ? "Correct!" : "Incorrect. Try again.",
    });

    if (isAnswerCorrect) {
      speak("Correct!", learningLanguage);
      if (currentPhraseIndex < phrases.length - 1) {
        setTimeout(() => {
          setCurrentPhraseIndex((prevIndex) => prevIndex + 1);
          setUserInput("");
          setFeedback({ isCorrect: null, message: "" });
          setShowTranslation(false);
        }, 1500);
      } else {
        onComplete();
      }
    } else {
      speak("Incorrect. Try again.", learningLanguage);
    }
  }, [
    currentPhraseIndex,
    learningLanguage,
    onComplete,
    phrases,
    speak,
    userInput,
  ]);

  const handleSpeak = useCallback(
    (text: string, language: string) => {
      speak(text, language);
    },
    [speak]
  );

  const handleSkip = useCallback(() => {
    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex((prevIndex) => prevIndex + 1);
      setUserInput("");
      setFeedback({ isCorrect: null, message: "" });
      setShowTranslation(false);
    } else {
      onComplete();
    }
  }, [currentPhraseIndex, phrases.length, onComplete]);

  const currentPhrase = phrases[currentPhraseIndex];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 text-center">
          Error loading phrases. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPhraseIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card className="p-6 sm:p-8 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl">
          <h3 className="text-2xl font-semibold mb-6 text-center">
            Practice using &quot;{word}&quot; in a phrase
          </h3>
          {currentPhrase && (
            <>
              <p className="text-xl mb-4 text-center">
                {currentPhrase.translation}
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
                <Button
                  onClick={() =>
                    handleSpeak(currentPhrase.translation, nativeLanguage)
                  }
                  disabled={speaking}
                  className="bg-primary/10 hover:bg-primary/20 text-primary"
                >
                  <Headphones className="mr-2 h-5 w-5" />
                  Listen in {nativeLanguage}
                </Button>
                <Button
                  onClick={() =>
                    handleSpeak(currentPhrase.original, learningLanguage)
                  }
                  disabled={speaking}
                  className="bg-secondary/10 hover:bg-secondary/20 text-secondary"
                >
                  <Volume2 className="mr-2 h-5 w-5" />
                  Listen in {learningLanguage}
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={`Type the phrase in ${learningLanguage}`}
                  className="flex-grow"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit();
                    }
                  }}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={speaking || userInput.trim() === ""}
                >
                  Submit
                </Button>
              </div>
              {feedback.isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-4"
                >
                  {feedback.isCorrect ? (
                    <p className="text-green-500 flex items-center justify-center">
                      <Check className="mr-2" /> {feedback.message}
                    </p>
                  ) : (
                    <>
                      <p className="text-red-500 flex items-center justify-center mb-2">
                        <X className="mr-2" /> {feedback.message}
                      </p>
                      <Button
                        onClick={() => setShowTranslation(true)}
                        variant="outline"
                      >
                        Show Correct Answer
                      </Button>
                    </>
                  )}
                </motion.div>
              )}
              {showTranslation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center"
                >
                  <p className="text-primary font-semibold">Correct answer:</p>
                  <p className="text-xl">{currentPhrase.original}</p>
                  <Button
                    onClick={() =>
                      handleSpeak(currentPhrase.original, learningLanguage)
                    }
                    disabled={speaking}
                    className="mt-2 bg-primary/10 hover:bg-primary/20 text-primary"
                  >
                    <Volume2 className="mr-2 h-5 w-5" />
                    Listen to Correct Answer
                  </Button>
                </motion.div>
              )}
            </>
          )}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
              Phrase {currentPhraseIndex + 1} of {phrases.length}
            </p>
            {currentPhraseIndex < phrases.length - 1 ? (
              <Button
                onClick={handleSkip}
                variant="outline"
                disabled={speaking}
              >
                Skip to Next Phrase
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button onClick={onComplete} disabled={speaking}>
                Complete Practice
              </Button>
            )}
          </div>
        </Card>
        <Progress value={progress} className="w-full mt-4" />
      </motion.div>
    </AnimatePresence>
  );
};

export default PhrasePractice;
