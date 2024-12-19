// File: components/landing-page/Features.tsx

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Brain,
  MessageCircle,
  BarChart2,
  Sparkles,

  Target,
  Globe,

  Check,

  Mic,
} from "lucide-react";

const features = [
  {
    title: "AI-Powered Pronunciation",
    description:
      "Get real-time feedback on your pronunciation with advanced AI speech analysis",
    icon: Mic,
    color: "from-purple-500 to-indigo-500",
    benefits: ["Instant feedback", "Native-like accent", "Personalized tips"],
  },
  {
    title: "Interactive Conversations",
    description: "Practice with AI language partners in real-world scenarios",
    icon: MessageCircle,
    color: "from-green-500 to-emerald-500",
    benefits: ["Natural dialogues", "Cultural context", "Adaptive responses"],
  },
  {
    title: "Smart Progress Tracking",
    description:
      "Monitor your improvement with detailed analytics and insights",
    icon: BarChart2,
    color: "from-blue-500 to-cyan-500",
    benefits: ["Visual progress", "Performance metrics", "Learning insights"],
  },
  {
    title: "Adaptive Learning Path",
    description:
      "Experience personalized lessons that adapt to your learning style",
    icon: Brain,
    color: "from-yellow-500 to-amber-500",
    benefits: ["Custom difficulty", "Memory optimization", "Spaced repetition"],
  },
  {
    title: "Cultural Immersion",
    description:
      "Learn language in context with cultural insights and authentic content",
    icon: Globe,
    color: "from-red-500 to-pink-500",
    benefits: ["Cultural notes", "Native content", "Real expressions"],
  },
  {
    title: "Gamified Practice",
    description: "Stay motivated with achievement-based learning and rewards",
    icon: Target,
    color: "from-orange-500 to-red-500",
    benefits: ["Daily challenges", "Skill badges", "Learning streaks"],
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background via-background/95 to-primary/10 relative overflow-hidden">
      {/* Modern Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-full">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full mix-blend-overlay opacity-20"
              style={{
                background: `radial-gradient(circle, rgba(var(--primary) / 0.2) 0%, transparent 70%)`,
                width: "60%",
                height: "60%",
                left: `${i * 30}%`,
                top: "20%",
              }}
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 30, 0],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 15 + i * 5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      </div>

      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground font-display">
            Advanced{" "}
            <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              Features
            </span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Experience the future of language learning with our cutting-edge
            AI-powered features
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full group relative overflow-hidden bg-card/50 backdrop-blur-sm border border-foreground/10 hover:border-primary/50 transition-all duration-300">
                {/* Feature gradient background */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${feature.color}`}
                />

                <div className="p-6 relative z-10">
                  {/* Icon */}
                  <div className="mb-6 relative">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <motion.div
                      className="absolute -inset-4 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0, 0.2, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/70 mb-4">
                    {feature.description}
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <motion.li
                        key={i}
                        className="flex items-center text-sm text-foreground/60"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <Check className="w-4 h-4 mr-2 text-primary" />
                        {benefit}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
