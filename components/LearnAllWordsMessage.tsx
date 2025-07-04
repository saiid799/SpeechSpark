import React from "react";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface LearnAllWordsMessageProps {
  show: boolean;
}

const LearnAllWordsMessage: React.FC<LearnAllWordsMessageProps> = ({
  show,
}) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-primary/10 border border-primary/20 rounded-lg p-4 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center space-x-2 text-primary">
        <AlertCircle className="h-5 w-5" />
        <p className="font-semibold">
          Learn at least 40 words (80%) in this batch to continue!
        </p>
      </div>
    </motion.div>
  );
};

export default LearnAllWordsMessage;
