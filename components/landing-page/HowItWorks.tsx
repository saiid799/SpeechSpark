// File: components/landing-page/HowItWorks.tsx

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  BrainCircuit,
  ArrowRight,
  MessageSquare,
  BarChart3,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

const steps = [
  {
    title: "AI Assessment",
    description:
      "Our AI evaluates your current language level and learning style to create a personalized learning path that adapts to your progress.",
    icon: BrainCircuit,
    image: "/images/assessment.png",
    features: [
      "Personalized level assessment",
      "Learning style analysis",
      "Custom study plan creation",
      "Adaptive difficulty scaling",
    ],
    color: "from-blue-500 to-cyan-500",
    glowColor: "blue",
  },
  {
    title: "Interactive Learning",
    description:
      "Practice through AI-powered conversations and exercises that simulate real-world scenarios and provide instant feedback.",
    icon: MessageSquare,
    image: "/images/interactive.png",
    features: [
      "Real-time pronunciation feedback",
      "Natural dialogue practice",
      "Cultural context learning",
      "Contextual vocabulary building",
    ],
    color: "from-violet-500 to-purple-500",
    glowColor: "violet",
  },
  {
    title: "Track Progress",
    description:
      "Monitor your improvement with detailed insights and milestones that keep you motivated and focused on your language goals.",
    icon: BarChart3,
    image: "/images/progress.png",
    features: [
      "Visual progress tracking",
      "Performance analytics",
      "Achievement system",
      "Learning streaks rewards",
    ],
    color: "from-green-500 to-emerald-500",
    glowColor: "green",
  },
];

const BackgroundAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Top-left gradient blob */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2"
        animate={{
          x: [0, 50, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Center gradient blob */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -60, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="w-full h-full bg-gradient-to-tr from-secondary/20 via-accent/20 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Bottom-right gradient blob */}
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2"
        animate={{
          x: [0, -50, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="w-full h-full bg-gradient-to-tl from-accent/30 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Extra animated elements */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${30 * i}%`,
              top: `${20 * i}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
          >
            <div className="w-64 h-64 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-full blur-xl" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const HowItWorks: React.FC = () => {
  return (
    <section className="relative py-32 overflow-hidden" id="how-it-works">
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95 backdrop-blur-[2px] z-0" />

      {/* Background Animation */}
      <BackgroundAnimation />

      <div className="container relative mx-auto px-4 z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block p-4 bg-primary/10 rounded-full mb-4 relative"
          >
            <Lightbulb className="w-8 h-8 text-primary relative z-10" />
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <h2 className="text-4xl md:text-5xl xl:text-6xl font-bold mb-6 text-foreground font-display">
            How{" "}
            <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              SpeechSpark
            </span>{" "}
            Works
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Experience a revolutionary approach to language learning with our
            AI-powered platform
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-32">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-16`}
            >
              {/* Image Section */}
              <div className="w-full lg:w-1/2">
                <motion.div
                  className="relative aspect-square rounded-3xl overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Floating Icons Effect */}
                  <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                      className="absolute"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                        x: [0, 20, 0],
                        y: [0, -20, 0],
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <step.icon
                        className={`w-8 h-8 text-${step.glowColor}-400`}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Content Section */}
              <div className="w-full lg:w-1/2">
                <Card className="p-8 bg-card/50 backdrop-blur-sm border border-primary/20 group hover:border-primary/40 transition-all duration-500">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="mb-8">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 relative`}
                      >
                        <step.icon className="w-8 h-8 text-white" />
                        <motion.div
                          className="absolute inset-0 rounded-2xl bg-white opacity-0"
                          animate={{ opacity: [0, 0.2, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                      <p className="text-foreground/80 text-lg leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <ul className="space-y-4">
                      {step.features.map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="flex items-center text-foreground/70 group/feature"
                        >
                          <div className="mr-3 transition-transform duration-300 group-hover/feature:scale-110">
                            <CheckCircle className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-base group-hover/feature:text-primary transition-colors duration-300">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-24"
        >
          <Link href="/sign-up">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="relative bg-gradient-to-r from-primary/90 via-primary to-secondary hover:from-primary hover:to-secondary/90 text-white text-lg px-8 py-6 rounded-xl shadow-lg group transition-all duration-300">
                <div className="absolute inset-0 bg-secondary/10 rounded-xl backdrop-blur-sm group-hover:opacity-0 transition-opacity duration-300" />
                <span className="relative flex items-center">
                  Start Your Journey
                  <motion.div
                    className="relative ml-2"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                    <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </span>
              </Button>
            </motion.div>
          </Link>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-foreground/60"
          >
            Join thousands of language learners today
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
