"use client"

import React from "react";
import { motion } from "framer-motion";
import { Book, Globe, Users, Zap, Award, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

const AboutPage: React.FC = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 pt-20 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-8 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          About SpeechSpark
        </motion.h1>

        <motion.div
          className="max-w-4xl mx-auto text-lg text-foreground/80 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="mb-6">
            SpeechSpark is revolutionizing language learning with cutting-edge
            AI technology and immersive experiences. Our mission is to break
            down language barriers and connect people across cultures through
            effective and engaging learning methods.
          </p>
          <p>
            Founded by language enthusiasts and tech experts, SpeechSpark offers
            personalized lesson plans, AI-powered conversations, and real-time
            feedback to accelerate your language learning journey. Whether
            you&apos;re a beginner or an advanced learner, SpeechSpark adapts to
            your needs and helps you achieve fluency faster than ever before.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        <motion.div
          className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-8 mb-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Our Vision
          </h2>
          <p className="text-foreground/80">
            At SpeechSpark, we envision a world where language is no longer a
            barrier to understanding, connection, and opportunity. We&apos;re
            committed to leveraging the latest advancements in AI and
            linguistics to create a learning experience that&apos;s not just
            effective, but truly transformative.
          </p>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-secondary to-accent">
            Join the SpeechSpark Community
          </h2>
          <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
            <motion.button
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSignedIn ? "Go to Dashboard" : "Start Your Journey Today"}
            </motion.button>
          </Link>
        </motion.div>
      </div>
      <BackgroundAnimation />
    </div>
  );
};

const features = [
  {
    title: "AI-Powered Learning",
    description:
      "Personalized lessons adapting to your learning style and pace.",
    icon: Zap,
  },
  {
    title: "Global Community",
    description: "Connect with language partners from around the world.",
    icon: Globe,
  },
  {
    title: "Immersive Experiences",
    description: "Practice with realistic scenarios and native speakers.",
    icon: Users,
  },
  {
    title: "Comprehensive Resources",
    description: "Access a vast library of learning materials and exercises.",
    icon: Book,
  },
  {
    title: "Progress Tracking",
    description:
      "Monitor your improvement with detailed analytics and insights.",
    icon: Award,
  },
  {
    title: "Gamified Learning",
    description: "Earn rewards and compete with friends to stay motivated.",
    icon: Sparkles,
  },
];

const FeatureCard: React.FC<{
  feature: (typeof features)[0];
  index: number;
}> = ({ feature, index }) => (
  <motion.div
    className="bg-card/50 backdrop-blur-sm border border-foreground/10 rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
  >
    <feature.icon className="w-12 h-12 text-primary mb-4" />
    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
    <p className="text-foreground/70">{feature.description}</p>
  </motion.div>
);

const BackgroundAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <div className="absolute -top-1/2 -left-1/2 w-full h-full">
        <motion.div
          className="w-full h-full bg-gradient-to-br from-primary to-transparent rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      <div className="absolute -bottom-1/2 -right-1/2 w-full h-full">
        <motion.div
          className="w-full h-full bg-gradient-to-tl from-secondary to-transparent rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -120, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </div>
  );
};

export default AboutPage;
