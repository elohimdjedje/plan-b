import { motion } from 'framer-motion';

/**
 * Animation de chargement avec éléphants qui marchent
 */
export default function ElephantLoader({ size = 'md', text = 'Chargement...' }) {
  const sizes = {
    sm: { width: 80, height: 60 },
    md: { width: 120, height: 90 },
    lg: { width: 160, height: 120 }
  };

  const currentSize = sizes[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Container des éléphants */}
      <div className="relative" style={{ width: currentSize.width, height: currentSize.height }}>
        {/* Éléphant adulte */}
        <motion.div
          animate={{
            x: [0, 10, 0],
            y: [0, -2, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute left-0"
        >
          <ElephantSVG size={currentSize.width * 0.6} />
        </motion.div>

        {/* Bébé éléphant */}
        <motion.div
          animate={{
            x: [0, 10, 0],
            y: [0, -2, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3 // Décalé pour effet de marche
          }}
          className="absolute right-0"
        >
          <ElephantSVG size={currentSize.width * 0.35} isBaby />
        </motion.div>
      </div>

      {/* Texte de chargement */}
      {text && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-secondary-600 text-sm font-medium"
        >
          {text}
        </motion.p>
      )}

      {/* Points de chargement */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * SVG de l'éléphant (style minimaliste/icône)
 */
function ElephantSVG({ size = 60, isBaby = false }) {
  const scale = isBaby ? 0.7 : 1;
  
  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 100 75"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `scale(${scale})` }}
    >
      {/* Corps de l'éléphant */}
      <motion.ellipse
        cx="50"
        cy="45"
        rx="35"
        ry="25"
        fill="url(#elephantGradient)"
        animate={{
          ry: [25, 26, 25]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Tête */}
      <motion.circle
        cx="30"
        cy="35"
        r="18"
        fill="url(#elephantGradient)"
        animate={{
          cy: [35, 34, 35]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Oreille gauche */}
      <motion.ellipse
        cx="22"
        cy="30"
        rx="8"
        ry="12"
        fill="#FF8C5F"
        opacity="0.8"
        animate={{
          rx: [8, 9, 8]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Oreille droite */}
      <motion.ellipse
        cx="38"
        cy="30"
        rx="8"
        ry="12"
        fill="#FF8C5F"
        opacity="0.8"
        animate={{
          rx: [8, 9, 8]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.3
        }}
      />

      {/* Trompe */}
      <motion.path
        d="M 25 40 Q 15 50, 12 65"
        stroke="url(#elephantGradient)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        animate={{
          d: [
            "M 25 40 Q 15 50, 12 65",
            "M 25 40 Q 18 48, 15 63",
            "M 25 40 Q 15 50, 12 65"
          ]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Pattes avant */}
      <motion.rect
        x="35"
        y="60"
        width="6"
        height="15"
        rx="3"
        fill="#FF8C5F"
        animate={{
          height: [15, 13, 15]
        }}
        transition={{
          duration: 0.75,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.rect
        x="45"
        y="60"
        width="6"
        height="15"
        rx="3"
        fill="#FF8C5F"
        animate={{
          height: [15, 13, 15]
        }}
        transition={{
          duration: 0.75,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.375
        }}
      />

      {/* Pattes arrière */}
      <motion.rect
        x="60"
        y="60"
        width="6"
        height="15"
        rx="3"
        fill="#FF8C5F"
        animate={{
          height: [15, 13, 15]
        }}
        transition={{
          duration: 0.75,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.1875
        }}
      />
      <motion.rect
        x="70"
        y="60"
        width="6"
        height="15"
        rx="3"
        fill="#FF8C5F"
        animate={{
          height: [15, 13, 15]
        }}
        transition={{
          duration: 0.75,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5625
        }}
      />

      {/* Oeil */}
      <circle cx="28" cy="32" r="2" fill="#2C3E50" />

      {/* Queue */}
      <motion.path
        d="M 85 50 Q 90 55, 88 60"
        stroke="#FF8C5F"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        animate={{
          d: [
            "M 85 50 Q 90 55, 88 60",
            "M 85 50 Q 88 53, 90 58",
            "M 85 50 Q 90 55, 88 60"
          ]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Gradients */}
      <defs>
        <linearGradient id="elephantGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="100%" stopColor="#FF8C5F" />
        </linearGradient>
      </defs>
    </svg>
  );
}
