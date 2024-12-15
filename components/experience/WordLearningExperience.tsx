// File: components/experience/WordLearningExperience.tsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useApi } from "@/hooks/useApi";
import confetti from "canvas-confetti";
import {
  Check,
  X,
  Volume2,
  ArrowRight,
  Headphones,
  RefreshCw,
} from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import CompletionPage from "./CompletionPage";

interface WordForm {
  form: string;
  translation: string;
}

interface Question {
  id: string;
  wordIndex: number;
  question: string;
  options: string[];
  correctAnswer: string;
  questionLanguage: "native" | "learning";
  answerLanguage: "native" | "learning";
}

interface WordLearningExperienceProps {
  wordIndex: number;
  original: string;
  translation: string;
  learningLanguage: string;
  nativeLanguage: string;
  onComplete: () => void;
  isReview?: boolean; // Added this prop
}

const WordLearningExperience: React.FC<WordLearningExperienceProps> = ({
  wordIndex,
  original,
  translation,
  learningLanguage,
  nativeLanguage,
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [mistakes, setMistakes] = useState<Set<number>>(new Set());
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quizStats, setQuizStats] = useState({
    correctAnswers: 0,
    totalQuestions: 0,
    streak: 0,
    attempts: [] as { questionId: string; attempts: number }[],
  });

  const { speak, speaking } = useSpeechSynthesis();
  const {
    request: fetchWordForms,
    data: wordFormsData,
    isLoading,
  } = useApi<WordForm[]>();

  const generateOptions = useCallback(
    (forms: WordForm[], correctAnswer: string, useForm: boolean): string[] => {
      const options = [correctAnswer];
      const allOptions = forms
        .map((f) => (useForm ? f.form : f.translation))
        .filter((o) => o !== correctAnswer);
      while (options.length < 4 && allOptions.length > 0) {
        const randomIndex = Math.floor(Math.random() * allOptions.length);
        options.push(allOptions[randomIndex]);
        allOptions.splice(randomIndex, 1);
      }
      return shuffleArray(options);
    },
    []
  );

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateQuestions = useCallback(
    (forms: WordForm[]): Question[] => {
      const questions: Question[] = [];
      forms.forEach((form, index) => {
        questions.push({
          id: `q-${index}-native`,
          wordIndex,
          question: `How do you say "${form.translation}" in ${learningLanguage}?`,
          options: generateOptions(forms, form.form, true),
          correctAnswer: form.form,
          questionLanguage: "native",
          answerLanguage: "learning",
        });

        questions.push({
          id: `q-${index}-learning`,
          wordIndex,
          question: `What does "${form.form}" mean in ${nativeLanguage}?`,
          options: generateOptions(forms, form.translation, false),
          correctAnswer: form.translation,
          questionLanguage: "learning",
          answerLanguage: "native",
        });
      });
      return shuffleArray(questions);
    },
    [generateOptions, learningLanguage, nativeLanguage, wordIndex]
  );

  useEffect(() => {
    fetchWordForms(`/api/words/${wordIndex}/forms`);
  }, [wordIndex, fetchWordForms]);

  useEffect(() => {
    if (wordFormsData) {
      const generatedQuestions = generateQuestions(wordFormsData);
      setQuestions(generatedQuestions);
      setQuizStats((prev) => ({
        ...prev,
        totalQuestions: generatedQuestions.length,
      }));
    }
  }, [wordFormsData, generateQuestions]);

  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex],
    [questions, currentQuestionIndex]
  );

  useEffect(() => {
    setProgress(((currentQuestionIndex + 1) / questions.length) * 100);
  }, [currentQuestionIndex, questions.length]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (selectedAnswer !== null) return;

      setSelectedAnswer(answer);
      const correct = answer === currentQuestion?.correctAnswer;
      setIsCorrect(correct);

      if (correct) {
        setQuizStats((prev) => ({
          ...prev,
          correctAnswers: prev.correctAnswers + 1,
          streak: prev.streak + 1,
        }));

        if (quizStats.streak > 0 && quizStats.streak % 3 === 2) {
          confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.6 },
          });
        }

        speak("Correct!", learningLanguage);
      } else {
        setMistakes((prev) => {
          const newMistakes = new Set(prev);
          newMistakes.add(currentQuestionIndex);
          return newMistakes;
        });
        setQuizStats((prev) => ({ ...prev, streak: 0 }));
        speak("Try again", learningLanguage);
      }

      // Update attempts
      const currentAttempts = quizStats.attempts.find(
        (a) => a.questionId === currentQuestion?.id
      );
      setQuizStats((prev) => ({
        ...prev,
        attempts: [
          ...prev.attempts.filter((a) => a.questionId !== currentQuestion?.id),
          {
            questionId: currentQuestion?.id || "",
            attempts: (currentAttempts?.attempts || 0) + 1,
          },
        ],
      }));
    },
    [
      currentQuestion,
      currentQuestionIndex,
      learningLanguage,
      quizStats.streak,
      quizStats.attempts,
      selectedAnswer,
      speak,
    ]
  );

  const handleComplete = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    speak("Congratulations! You've completed the exercise!", learningLanguage);
    setStep(2);
  }, [learningLanguage, speak]);

  const nextQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (mistakes.size > 0 && !isReviewMode) {
      setIsReviewMode(true);
      setCurrentQuestionIndex(Array.from(mistakes)[0]);
    } else {
      handleComplete();
    }
  }, [
    currentQuestionIndex,
    questions.length,
    mistakes,
    isReviewMode,
    handleComplete,
  ]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RefreshCw className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-primary/10">
      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-6"
          >
            {step === 0 && (
              <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gradient">
                  Learn &quot;{original}&quot;
                </h2>
                <p className="mb-8 text-xl sm:text-2xl">
                  Translation: {translation}
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button
                    onClick={() => speak(original, learningLanguage)}
                    className="bg-primary/10 hover:bg-primary/20 text-primary text-lg py-3 px-6 rounded-full"
                    disabled={speaking}
                  >
                    <Volume2 className="mr-2 h-5 w-5" />
                    Listen
                  </Button>
                  <Button
                    onClick={() => setStep(1)}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-4 rounded-full"
                  >
                    Start Learning
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </Card>
            )}

            {step === 1 && currentQuestion && (
              <Card className="p-8 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl">
                <h3 className="text-2xl font-semibold mb-8 text-center">
                  {currentQuestion.question}
                </h3>
                <div className="flex justify-center mb-6">
                  <Button
                    onClick={() =>
                      speak(
                        currentQuestion.question,
                        currentQuestion.questionLanguage === "native"
                          ? nativeLanguage
                          : learningLanguage
                      )
                    }
                    className="bg-primary/10 hover:bg-primary/20 text-primary text-lg py-3 px-6 rounded-full"
                    disabled={speaking}
                  >
                    <Headphones className="mr-2 h-5 w-5" />
                    Listen to Question
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null || speaking}
                      variant={
                        selectedAnswer === option
                          ? isCorrect
                            ? "default"
                            : "destructive"
                          : "outline"
                      }
                      className="h-24 text-lg rounded-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                    >
                      <span className="relative z-10">{option}</span>
                      <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          speak(
                            option,
                            currentQuestion.answerLanguage === "native"
                              ? nativeLanguage
                              : learningLanguage
                          );
                        }}
                        disabled={speaking}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </Button>
                  ))}
                </div>

                {selectedAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 text-center"
                  >
                    <p
                      className={`text-2xl font-semibold flex items-center justify-center ${
                        isCorrect ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <Check className="mr-2" /> Correct!
                        </>
                      ) : (
                        <>
                          <X className="mr-2" /> Incorrect. The correct answer
                          is: {currentQuestion.correctAnswer}
                        </>
                      )}
                    </p>
                    <Button
                      onClick={nextQuestion}
                      className="mt-6 bg-primary hover:bg-primary/90 text-white text-lg px-8 py-4 rounded-full"
                      disabled={speaking}
                    >
                      {isReviewMode &&
                      currentQuestionIndex === questions.length - 1
                        ? "Complete Review"
                        : "Next Question"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                )}
              </Card>
            )}

            {step === 2 && (
              <CompletionPage
                word={original}
                translation={translation}
                learningLanguage={learningLanguage}
                nativeLanguage={nativeLanguage}
                stats={quizStats}
                onContinue={onComplete}
              />
            )}

            {step !== 0 && (
              <Progress value={progress} className="w-full mt-6" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WordLearningExperience;
