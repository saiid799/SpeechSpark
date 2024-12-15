// components/CustomToast.tsx

import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface CustomToastProps {
  message: string;
}

const CustomToast: React.FC<CustomToastProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3"
    >
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        <Zap className="w-6 h-6" />
      </motion.div>
      <p className="font-medium">{message}</p>
    </motion.div>
  );
};

export default CustomToast;
