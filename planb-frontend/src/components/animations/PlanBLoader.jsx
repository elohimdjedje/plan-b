import { motion } from 'framer-motion';

/**
 * Loader minimaliste style macOS - petit et élégant
 */
export default function PlanBLoader({ text = "Chargement..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
      {/* Spinner style macOS */}
      <motion.div
        className="relative w-8 h-8"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 left-1/2 w-0.5 h-2 rounded-full bg-primary-500"
            style={{
              transformOrigin: '50% 16px',
              transform: `rotate(${i * 30}deg)`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* Slogan animé */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mt-8 text-xs text-secondary-600 font-semibold tracking-wider"
      >
        POUR VOUS IL Y A TOUJOURS UN PLAN B...
      </motion.p>
    </div>
  );
}
