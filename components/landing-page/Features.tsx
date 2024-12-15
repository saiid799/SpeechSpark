// File: components/landing-page/Features.tsx

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  MessageCircle,
  BarChart2,
  Zap,
  Globe,
  Headphones,
} from "lucide-react";

const features = [
  {
    title: "AI-Powered Learning",
    description:
      "Our advanced AI algorithms create personalized learning paths tailored to your unique needs and goals.",
    icon: Brain,
    color: "from-purple-500 to-indigo-500",
  },
  {
    title: "Interactive Conversations",
    description:
      "Practice speaking with our AI language partners in realistic scenarios to build confidence and fluency.",
    icon: MessageCircle,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Progress Tracking",
    description:
      "Monitor your improvement with detailed analytics and insights to stay motivated on your language journey.",
    icon: BarChart2,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Adaptive Difficulty",
    description:
      "Experience a dynamic learning environment that adjusts to your skill level in real-time.",
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
  },
  {
    title: "Multi-Language Support",
    description:
      "Choose from a wide variety of languages to learn, with new ones added regularly.",
    icon: Globe,
    color: "from-red-500 to-pink-500",
  },
  {
    title: "Pronunciation Feedback",
    description:
      "Receive instant feedback on your pronunciation to perfect your accent and speaking skills.",
    icon: Headphones,
    color: "from-orange-500 to-red-500",
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background via-background/95 to-secondary/10 relative overflow-hidden">
      <BackgroundAnimation />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block p-4 bg-secondary/10 rounded-full mb-4">
            <Zap className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground font-display">
            Powerful{" "}
            <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              Features
            </span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Discover the innovative tools and technologies that make SpeechSpark
            the ultimate language learning platform.
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
              <Card className="h-full bg-card/50 backdrop-blur-sm border border-foreground/10 hover:border-primary/50 transition-all duration-300 overflow-hidden group">
                <CardContent className="p-6 flex flex-col h-full relative z-10">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10`}
                  />
                  <div className="mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/80 flex-grow">
                    {feature.description}
                  </p>
                  <motion.div
                    className="mt-4 overflow-hidden"
                    initial={{ height: 0 }}
                    whileHover={{ height: "auto" }}
                  >
                    <p className="text-sm text-primary/80">
                      Hover to learn more about this feature.
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BackgroundAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-1/2 -left-1/2 w-full h-full"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="w-full h-full bg-gradient-conic from-primary/20 via-secondary/20 to-accent/20 opacity-30 blur-3xl" />
      </motion.div>
      <motion.div
        className="absolute -bottom-1/2 -right-1/2 w-full h-full"
        animate={{
          rotate: [360, 0],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="w-full h-full bg-gradient-conic from-accent/20 via-primary/20 to-secondary/20 opacity-30 blur-3xl" />
      </motion.div>
    </div>
  );
};

export default Features;
