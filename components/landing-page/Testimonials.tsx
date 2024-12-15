import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Michael R.",
    role: "English Learner",
    image: "/images/Michael.png",
    quote:
      "SpeechSpark has revolutionized my language learning journey. The AI-powered conversations feel so natural!",
    rating: 5,
  },
  {
    name: "Sarah L.",
    role: "Spanish Enthusiast",
    image: "/images/Sarah.png",
    quote:
      "I've tried many language apps, but none compare to the personalized experience SpeechSpark provides.",
    rating: 5,
  },
  {
    name: "Silva T.",
    role: "Multilingual Student",
    image: "/images/Silva.png",
    quote:
      "The progress tracking feature keeps me motivated. I can clearly see how much I've improved!",
    rating: 5,
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-t from-background via-background/95 to-primary/10 overflow-hidden">
      <div className="container relative mx-auto px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground font-display">
            What Our{" "}
            <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              Users Say
            </span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Discover how SpeechSpark is transforming language learning for
            people around the world.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </div>
      <BackgroundAnimation />
    </section>
  );
};

const TestimonialCard: React.FC<{
  testimonial: (typeof testimonials)[0];
  index: number;
}> = ({ testimonial, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: index * 0.2 }}
  >
    <Card className="h-full bg-background/30 backdrop-blur-sm border border-foreground/10 hover:border-primary/50 transition-all duration-300 group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
            <Image
              src={testimonial.image}
              alt={testimonial.name}
              fill
              sizes="64px"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground font-display">
              {testimonial.name}
            </h3>
            <p className="text-sm text-foreground/60">{testimonial.role}</p>
            <div className="flex mt-1">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 text-yellow-500 fill-current"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-grow flex items-center relative">
          <Quote className="w-12 h-12 text-primary/20 absolute top-0 left-0 transform -translate-x-2 -translate-y-2" />
          <p className="text-foreground/80 italic relative z-10 pl-6">
            {testimonial.quote}
          </p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const BackgroundAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-1/2 -right-1/2 w-full h-full">
        <motion.div
          className="w-full h-full bg-gradient-to-bl from-primary/20 to-transparent rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      <div className="absolute -bottom-1/2 -left-1/2 w-full h-full">
        <motion.div
          className="w-full h-full bg-gradient-to-tr from-secondary/20 to-transparent rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 120, 0],
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

export default Testimonials;
