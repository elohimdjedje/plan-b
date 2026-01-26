import { motion } from 'framer-motion';

/**
 * Spinner style macOS - version inline
 */
export default function MacSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const barSizes = {
    sm: { width: '2px', height: '6px', origin: '12px' },
    md: { width: '2px', height: '8px', origin: '16px' },
    lg: { width: '3px', height: '10px', origin: '20px' }
  };

  const barConfig = barSizes[size] || barSizes.md;

  return (
    <div className={`relative ${sizes[size] || sizes.md} ${className}`}>
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary-500"
          style={{
            width: barConfig.width,
            height: barConfig.height,
            top: '0',
            left: '50%',
            marginLeft: `-${parseInt(barConfig.width) / 2}px`,
            transformOrigin: `center ${barConfig.origin}`,
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
  );
}
