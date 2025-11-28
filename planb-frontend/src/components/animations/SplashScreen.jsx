import { motion } from 'framer-motion';
import { useEffect } from 'react';

/**
 * Écran de démarrage simple avec logo au centre
 */
export default function SplashScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      {/* Fond flouté avec gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-blue-50 to-purple-100 backdrop-blur-3xl" />
      
      {/* Cercles flous pour effet de profondeur */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl"
        />
      </div>

      {/* Logo qui tombe et rebondit comme une balle */}
      <motion.div
        initial={{ y: -500, opacity: 0 }}
        animate={{ 
          y: [null, 0, -50, 0, -20, 0, -5, 0],
          opacity: 1,
          rotate: [0, -10, 10, -5, 5, 0]
        }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ 
          y: {
            duration: 1.5,
            times: [0, 0.4, 0.55, 0.7, 0.8, 0.9, 0.95, 1],
            ease: "easeOut"
          },
          opacity: { duration: 0.3 },
          rotate: {
            duration: 1.5,
            times: [0, 0.4, 0.55, 0.7, 0.8, 1],
            ease: "easeOut"
          }
        }}
        className="relative z-10"
      >
        <img 
          src="/plan-b-logo.png" 
          alt="Plan B" 
          className="w-64 h-auto object-contain drop-shadow-2xl"
        />
      </motion.div>
    </motion.div>
  );
}
