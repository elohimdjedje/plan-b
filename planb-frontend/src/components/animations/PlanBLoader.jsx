import { motion } from 'framer-motion';

/**
 * Loader style macOS - centré et adaptatif
 */
export default function PlanBLoader({ text = "Chargement..." }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
      {/* Spinner style macOS */}
      <div className="relative w-10 h-10">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[3px] h-[10px] rounded-full bg-primary-500"
            style={{
              top: '0',
              left: '50%',
              marginLeft: '-1.5px',
              transformOrigin: 'center 20px',
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
      </div>

      {/* Slogan */}
      <motion.p
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mt-8 text-xs text-secondary-500 font-medium tracking-wide text-center"
      >
        POUR VOUS IL Y A TOUJOURS UN PLAN B...
      </motion.p>
    </div>
  );
}
