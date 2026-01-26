import { motion } from 'framer-motion';

/**
 * Animation de chargement style macOS - inline
 */
export default function ElephantLoader({ size = 'md', text = 'Chargement...' }) {
  const sizes = {
    sm: { container: 'w-6 h-6', origin: '12px' },
    md: { container: 'w-8 h-8', origin: '16px' },
    lg: { container: 'w-10 h-10', origin: '20px' }
  };
  
  const config = sizes[size] || sizes.md;
  
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Spinner style macOS */}
      <div className={`relative ${config.container}`}>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[8px] rounded-full bg-primary-500"
            style={{
              top: '0',
              left: '50%',
              marginLeft: '-1px',
              transformOrigin: `center ${config.origin}`,
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

      {/* Texte de chargement */}
      {text && (
        <p className="text-secondary-500 text-xs font-medium">
          {text}
        </p>
      )}
    </div>
  );
}
