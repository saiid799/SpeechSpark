// File: components/UserQuestionnaire.tsx

"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronRight,
  ChevronLeft,
  Globe,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useDebouncedCallback } from "use-debounce";
import LanguageCard from "@/components/LanguageCard";
import { languages, proficiencyLevels } from "@/lib/languageData";

const UserQuestionnaire: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    nativeLanguage: "",
    learningLanguage: "",
    proficiencyLevel: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const steps = [
    { title: "Native Language", icon: Globe },
    { title: "Learning Language", icon: BookOpen },
    { title: "Proficiency Level", icon: Sparkles },
  ];

  const updateFormData = useCallback((key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors([]);
  }, []);

  const debouncedUpdateFormData = useDebouncedCallback(updateFormData, 300);

  const validateStep = useCallback(() => {
    const currentField = Object.keys(formData)[step];
    return !!formData[currentField as keyof typeof formData];
  }, [formData, step]);

  const handleSubmit = async () => {
    if (!validateStep()) {
      setErrors(["Please select an option before continuing."]);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user?.id,
          email: user?.primaryEmailAddress?.emailAddress,
          firstName: user?.firstName,
          lastName: user?.lastName,
          ...formData,
          targetWordCount: 1000, // Each level has 1000 words
        }),
      });

      if (response.ok) {
        toast.success("Profile created successfully!");
        router.push("/dashboard");
      } else {
        const errorData = await response.json();
        setErrors(errorData.details || ["Failed to save profile"]);
      }
    } catch (error) {
      console.error("Error saving user data:", error);
      setErrors(["An unexpected error occurred. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = useCallback(() => {
    if (validateStep()) {
      setStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      setErrors(["Please select an option before proceeding."]);
    }
  }, [validateStep, steps.length]);

  const prevStep = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 0));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-card/30 backdrop-blur-sm shadow-lg border border-primary/10">
        <div className="p-8">
          {/* Progress Steps */}
          <div className="flex justify-between mb-12">
            {steps.map((s, index) => (
              <div key={s.title} className="flex flex-col items-center">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    step >= index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <s.icon size={24} />
                </motion.div>
                <span className="text-sm mt-2 text-muted-foreground">
                  {s.title}
                </span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="native-language"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-2xl font-semibold mb-6 text-center">
                  What&apos;s your native language?
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {languages.map((lang) => (
                    <LanguageCard
                      key={lang.code}
                      language={lang}
                      selected={formData.nativeLanguage === lang.name}
                      onClick={() =>
                        debouncedUpdateFormData("nativeLanguage", lang.name)
                      }
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="learning-language"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-2xl font-semibold mb-6 text-center">
                  Which language do you want to learn?
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {languages
                    .filter((lang) => lang.name !== formData.nativeLanguage)
                    .map((lang) => (
                      <LanguageCard
                        key={lang.code}
                        language={lang}
                        selected={formData.learningLanguage === lang.name}
                        onClick={() =>
                          debouncedUpdateFormData("learningLanguage", lang.name)
                        }
                      />
                    ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="proficiency"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-2xl font-semibold mb-6 text-center">
                  What&apos;s your current proficiency level?
                </h3>
                <p className="text-center text-muted-foreground mb-6">
                  Start with A1 or A2. Higher levels will be unlocked as you
                  progress.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {proficiencyLevels.map((level) => (
                    <Card
                      key={level.value}
                      className={`p-6 cursor-pointer transition-all duration-300 ${
                        formData.proficiencyLevel === level.value
                          ? "bg-primary/20 border-primary"
                          : "bg-card hover:bg-primary/10"
                      }`}
                      onClick={() =>
                        debouncedUpdateFormData("proficiencyLevel", level.value)
                      }
                    >
                      <h4 className="text-lg font-semibold mb-2">
                        {level.label}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {level.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-primary">
                          {level.wordCount} words
                        </span>
                        {level.value === "A1" && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Recommended for beginners
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-4">
                        {level.benefit}
                      </p>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-secondary/10 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-secondary-foreground font-medium mb-1">
                        Level Progression System
                      </p>
                      <p className="text-sm text-secondary-foreground/80">
                        Each level contains 1000 carefully selected words.
                        Higher levels (B1, B2, C1) will be unlocked
                        automatically as you master the current level. This
                        structured approach ensures a solid foundation for your
                        language learning journey.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Messages */}
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md"
            >
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-500">
                    {error}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 0 || isSubmitting}
              className="w-[120px] h-12 bg-background/50 border-primary/20 hover:bg-primary/10"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Previous
            </Button>

            <Button
              onClick={step === steps.length - 1 ? handleSubmit : nextStep}
              disabled={!validateStep() || isSubmitting}
              className="w-[120px] h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : step === steps.length - 1 ? (
                "Start Learning"
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserQuestionnaire;