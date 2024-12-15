// File: components/LevelMessage.tsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface LevelMessageProps {
  show: boolean;
  level: string;
  onClose: () => void;
}

const LevelMessage: React.FC<LevelMessageProps> = ({
  show,
  level,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4 shadow-lg max-w-md w-full"
        >
          <div className="flex items-start space-x-3 text-primary">
            <AlertCircle className="h-6 w-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">
                Level {level} Not Available Yet
              </h3>
              <p className="text-sm text-foreground/80">
                Complete the previous levels to unlock level {level}. Keep
                practicing and you&apos;ll get there soon!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-foreground/60 hover:text-foreground"
          >
            &times;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelMessage;
