import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, MessageCircle, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Personalized Learning",
    description: "AI-powered lessons tailored to your skill level and goals",
    icon: Lightbulb,
    image: "/images/personalized-learning.png",
  },
  {
    title: "Interactive Conversations",
    description: "Practice speaking with our advanced AI language partners",
    icon: MessageCircle,
    image: "/images/interactive-conversations.png",
  },
  {
    title: "Progress Tracking",
    description:
      "Monitor your improvement with detailed analytics and insights",
    icon: BarChart3,
    image: "/images/progress-tracking.png",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-background via-background/95 to-secondary/10 overflow-hidden">
      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground font-display">
            How It{" "}
            <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              Works
            </span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            SpeechSpark combines cutting-edge AI technology with proven language
            learning methods to help you master any language faster and more
            effectively.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground font-display">
            Ready to Transform Your Language Learning?
          </h3>
          <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who have accelerated their language
            mastery with SpeechSpark&apos;s AI-powered platform.
          </p>
          <Link href="/sign-up">
            <motion.button
              className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
      <BackgroundAnimation />
    </section>
  );
};

const FeatureCard: React.FC<{
  feature: (typeof features)[0];
  index: number;
}> = ({ feature, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: index * 0.2 }}
    className="relative z-10"
  >
    <Card className="h-full bg-background/30 backdrop-blur-sm border border-foreground/10 hover:border-primary/50 transition-all duration-300 group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl">
      <CardContent className="p-0">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={feature.image}
            alt={feature.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
            className="transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-4 left-4 bg-primary/90 text-primary-foreground p-3 rounded-full transform group-hover:scale-110 transition-transform duration-300">
            <feature.icon className="w-6 h-6" />
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-2xl font-semibold text-foreground font-display mb-3 group-hover:text-primary transition-colors duration-300">
            {feature.title}
          </h3>
          <p className="text-foreground/80 group-hover:text-foreground transition-colors duration-300">
            {feature.description}
          </p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const BackgroundAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-1/2 -left-1/2 w-full h-full">
        <motion.div
          className="w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-full"
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
          className="w-full h-full bg-gradient-to-tl from-secondary/20 to-transparent rounded-full"
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

export default HowItWorks;
