import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Volume2, Check, X, ArrowRight, Trophy, Brain } from "lucide-react";
import StarEvaluation from "../evaluation/StarEvaluation";
import ReviewMode from "./ReviewMode";
import CompletionPage from "./CompletionPage";

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  questionLanguage: "native" | "learning";
  answerLanguage: "native" | "learning";
}

interface QuizProps {
  questions: Question[];
  learningLanguage: string;
  nativeLanguage: string;
  onComplete: (performance: {
    correctAnswers: number;
    totalQuestions: number;
    streak: number;
    attempts: { questionId: string; attempts: number }[];
  }) => void;
}

const Quiz: React.FC<QuizProps> = ({
  questions,
  learningLanguage,
  nativeLanguage,
  onComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showCompletionPage, setShowCompletionPage] = useState(false);
  const [mistakes, setMistakes] = useState<Question[]>([]);
  const [questionAttempts, setQuestionAttempts] = useState<{ [key: string]: number }>({});
  const [score, setScore] = useState(0);

  const { speak, speaking } = useSpeechSynthesis();

  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex],
    [questions, currentQuestionIndex]
  );

  const progress = useMemo(
    () => ((currentQuestionIndex + 1) / questions.length) * 100,
    [currentQuestionIndex, questions.length]
  );

  useEffect(() => {
    if (currentQuestion) {
      const language =
        currentQuestion.questionLanguage === "native"
          ? nativeLanguage
          : learningLanguage;
      speak(currentQuestion.question, language);
    }
  }, [currentQuestion, nativeLanguage, learningLanguage, speak]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (selectedAnswer !== null) return;

      setSelectedAnswer(answer);
      const correct = answer === currentQuestion.correctAnswer;
      setIsCorrect(correct);

      setQuestionAttempts(prev => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1
      }));

      if (correct) {
        setCorrectAnswers(prev => prev + 1);
        const newStreak = streak + 1;
        setStreak(newStreak);
        setBestStreak(Math.max(bestStreak, newStreak));
        
        const streakBonus = Math.min(newStreak * 10, 50);
        const basePoints = 100;
        const attempts = questionAttempts[currentQuestion.id] || 1;
        const attemptsMultiplier = 1 / attempts;
        const questionScore = (basePoints + streakBonus) * attemptsMultiplier;
        
        setScore(prev => prev + Math.round(questionScore));

        if (newStreak > 0 && newStreak % 5 === 0) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#16B981", "#6366F1", "#F59E0B"],
          });
        }

        speak("Excellent!", learningLanguage);
      } else {
        setStreak(0);
        setMistakes(prev => [...prev, currentQuestion]);
        speak("Try again", learningLanguage);
      }
    },
    [currentQuestion, learningLanguage, speak, streak, bestStreak, questionAttempts]
  );

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (mistakes.length > 0 && !isReviewMode) {
      setIsReviewMode(true);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setCurrentQuestionIndex(0);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      setShowEvaluation(true);
      const attempts = Object.entries(questionAttempts).map(([questionId, attempts]) => ({
        questionId,
        attempts
      }));
      
      confetti({
        particleCount: Math.min(correctAnswers * 50, 200),
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#16B981", "#6366F1", "#F59E0B"],
      });

      onComplete({
        correctAnswers,
        totalQuestions: questions.length,
        streak: bestStreak,
        attempts
      });
    }
  }, [
    currentQuestionIndex,
    questions.length,
    onComplete,
    correctAnswers,
    bestStreak,
    questionAttempts,
    mistakes.length,
    isReviewMode
  ]);

  const handleEvaluationComplete = useCallback(() => {
    setShowCompletionPage(true);
  }, []);

  const handleCompletionContinue = useCallback(() => {
    onComplete({
      correctAnswers,
      totalQuestions: questions.length,
      streak: bestStreak,
      attempts: Object.entries(questionAttempts).map(([questionId, attempts]) => ({
        questionId,
        attempts,
      }))
    });
  }, [correctAnswers, questions.length, bestStreak, questionAttempts, onComplete]);

  if (showCompletionPage) {
    return (
      <CompletionPage
        word={currentQuestion.question}
        translation={currentQuestion.correctAnswer}
        learningLanguage={learningLanguage}
        nativeLanguage={nativeLanguage}
        stats={{
          correctAnswers,
          totalQuestions: questions.length,
          streak: bestStreak,
        }}
        onContinue={handleCompletionContinue}
      />
    );
  }

  if (showEvaluation) {
    return (
      <StarEvaluation
        correctAnswers={correctAnswers}
        totalQuestions={questions.length}
        streak={bestStreak}
        attempts={Object.entries(questionAttempts).map(([questionId, attempts]) => ({
          questionId,
          attempts,
        }))}
        onContinue={handleEvaluationComplete}
      />
    );
  }

  if (isReviewMode) {
    return (
      <ReviewMode
        mistakes={mistakes}
        learningLanguage={learningLanguage}
        nativeLanguage={nativeLanguage}
        onComplete={() => setShowEvaluation(true)}
      />
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border border-primary/20 rounded-xl shadow-lg">
      <CardContent className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <span className="text-lg font-semibold">{score}</span>
                <span className="text-sm text-muted-foreground ml-1">points</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-primary" />
              <div>
                <span className="text-lg font-semibold">{streak}</span>
                <span className="text-sm text-muted-foreground ml-1">streak</span>
              </div>
            </div>
          </div>
        </div>

        <Progress value={progress} className="mb-8" />

        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              {currentQuestion?.question}
            </h3>
            <Button
              onClick={() => {
                const language =
                  currentQuestion?.questionLanguage === "native"
                    ? nativeLanguage
                    : learningLanguage;
                speak(currentQuestion?.question, language);
              }}
              disabled={speaking}
              className="bg-primary/10 hover:bg-primary/20 text-primary"
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Listen Again
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="wait">
              {currentQuestion?.options.map((option, index) => (
                <motion.div
                  key={option}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    onClick={() => handleAnswer(option)}
                    disabled={selectedAnswer !== null || speaking}
                    className={`
                      w-full h-20 text-lg rounded-xl transition-all duration-300
                      ${
                        selectedAnswer === option
                          ? isCorrect
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                          : "bg-card hover:bg-primary/10"
                      }
                      relative group
                    `}
                  >
                    <span>{option}</span>
                    {selectedAnswer === option && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-2"
                      >
                        {isCorrect ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          <X className="w-6 h-6" />
                        )}
                      </motion.span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        const language =
                          currentQuestion.answerLanguage === "learning"
                            ? learningLanguage
                            : nativeLanguage;
                        speak(option, language);
                      }}
                      disabled={speaking}
                      className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {selectedAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <Button
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg rounded-full"
              >
                {currentQuestionIndex === questions.length - 1 ? (
                  mistakes.length > 0 ? "Start Review Mode" : "Complete Quiz"
                ) : (
                  <>
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>

        <div className="mt-8 flex justify-between text-sm text-muted-foreground">
          <span>
            Question {currentQuestionIndex + 1} of {questions.length}
            {isReviewMode && " (Review Mode)"}
          </span>
          <span>Best Streak: {bestStreak}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default Quiz;