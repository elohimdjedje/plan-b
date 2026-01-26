import React from 'react';
import { motion } from 'framer-motion';

/**
 * Indicateur "en train d'écrire"
 * Animation de 3 points qui rebondissent
 */
const TypingIndicator = ({ userName = 'L\'utilisateur' }) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="bg-gray-200 rounded-2xl px-4 py-3 flex items-center gap-1">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0,
          }}
          className="w-2 h-2 bg-gray-500 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0.2,
          }}
          className="w-2 h-2 bg-gray-500 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0.4,
          }}
          className="w-2 h-2 bg-gray-500 rounded-full"
        />
      </div>
      <span className="text-xs text-gray-500">{userName} écrit...</span>
    </div>
  );
};

export default TypingIndicator;
