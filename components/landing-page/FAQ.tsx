// File: components/landing-page/FAQ.tsx

import React from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Plus } from "lucide-react";

const faqs = [
  {
    question: "What is SpeechSpark?",
    answer:
      "SpeechSpark is an AI-powered language learning platform that helps users master new languages through personalized lessons, interactive conversations, and real-time progress tracking.",
  },
  {
    question: "How does SpeechSpark use AI?",
    answer:
      "SpeechSpark utilizes advanced AI algorithms to create tailored learning experiences, generate practice conversations, and provide instant feedback on pronunciation and grammar.",
  },
  {
    question: "What languages can I learn with SpeechSpark?",
    answer:
      "SpeechSpark offers a wide range of languages, including English, Spanish, French, German, Italian, Chinese, Japanese, and many more. We're constantly adding new languages to our platform.",
  },
  {
    question: "Is SpeechSpark suitable for beginners?",
    answer:
      "Absolutely! SpeechSpark is designed for learners of all levels, from complete beginners to advanced speakers. Our AI adapts the content and difficulty to match your current proficiency level.",
  },
  {
    question: "How much does SpeechSpark cost?",
    answer:
      "SpeechSpark offers a free tier with basic features. For full access to all features and content, we have affordable premium plans. Visit our pricing page for more details.",
  },
];

const FAQ: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background via-background/95 to-primary/10 relative overflow-hidden">
      <BackgroundAnimation />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground font-display">
            Frequently Asked{" "}
            <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Got questions? We&apos;ve got answers! Check out our most commonly
            asked questions below.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-6">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-primary/20 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm"
              >
                <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-foreground hover:text-primary transition-colors duration-200">
                  <span>{faq.question}</span>
                  <Plus className="w-5 h-5 text-primary shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-45" />
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 text-foreground/80">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {faq.answer}
                  </motion.div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
        
      </div>
    </section>
  );
};

const BackgroundAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-1/2 -right-1/2 w-full h-full"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="w-full h-full bg-gradient-conic from-primary/10 via-secondary/10 to-accent/10 opacity-30 blur-3xl" />
      </motion.div>
      <motion.div
        className="absolute -bottom-1/2 -left-1/2 w-full h-full"
        animate={{
          rotate: [360, 0],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="w-full h-full bg-gradient-conic from-accent/10 via-primary/10 to-secondary/10 opacity-30 blur-3xl" />
      </motion.div>
    </div>
  );
};

export default FAQ;
