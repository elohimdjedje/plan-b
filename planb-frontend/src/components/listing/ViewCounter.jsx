import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye } from 'lucide-react';

/**
 * Composant de compteur de vues - Style réseaux sociaux
 * Affiche le nombre de vues avec animation et formatage intelligent
 */
export default function ViewCounter({ views = 0, className = '', animated = true }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    if (animated && displayValue !== views) {
      // Détecter si c'est une nouvelle vue
      if (views > displayValue) {
        setIsNew(true);
        setTimeout(() => setIsNew(false), 1000);
      }

      // Animation du compteur
      const duration = 500;
      const steps = 20;
      const increment = (views - displayValue) / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayValue(views);
          clearInterval(timer);
        } else {
          setDisplayValue(prev => Math.round(prev + increment));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(views);
    }
  }, [views, animated]);

  /**
   * Formater le nombre de vues comme sur les réseaux sociaux
   * Exemples: 999, 1k, 10k, 1M, etc.
   */
  const formatViews = (count) => {
    if (count < 1000) {
      return count.toString();
    } else if (count < 1000000) {
      const k = count / 1000;
      return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
    } else {
      const m = count / 1000000;
      return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
    }
  };

  return (
    <motion.div
      className={`flex items-center gap-1.5 ${className}`}
      initial={animated ? { opacity: 0, scale: 0.8 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Icône œil */}
      <motion.div
        animate={isNew ? {
          scale: [1, 1.3, 1],
          rotate: [0, -10, 10, 0]
        } : {}}
        transition={{ duration: 0.5 }}
      >
        <Eye 
          size={16} 
          className={`
            ${isNew ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'}
            transition-colors duration-300
          `}
        />
      </motion.div>

      {/* Compteur avec animation */}
      <AnimatePresence mode="wait">
        <motion.span
          key={displayValue}
          initial={animated ? { opacity: 0, y: -10 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={animated ? { opacity: 0, y: 10 } : false}
          transition={{ duration: 0.2 }}
          className={`
            text-sm font-medium
            ${isNew ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'}
            transition-colors duration-300
          `}
        >
          {formatViews(displayValue)}
        </motion.span>
      </AnimatePresence>

      {/* Badge "Populaire" pour les annonces très vues */}
      {views >= 1000 && (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="
            px-1.5 py-0.5 rounded-full
            bg-gradient-to-r from-orange-500 to-red-500
            text-white text-[10px] font-bold uppercase
            shadow-sm
          "
        >
          Hot
        </motion.span>
      )}
    </motion.div>
  );
}

/**
 * Version compacte pour les cartes d'annonces
 */
export function ViewCounterCompact({ views = 0, className = '' }) {
  const formatViews = (count) => {
    if (count < 1000) return count;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  return (
    <div className={`flex items-center gap-1 text-gray-500 dark:text-gray-400 ${className}`}>
      <Eye size={14} />
      <span className="text-xs font-medium">{formatViews(views)}</span>
    </div>
  );
}

/**
 * Statistiques de vues détaillées
 */
export function ViewStats({ total = 0, last24h = 0, last7days = 0, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">Vues totales</span>
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {total.toLocaleString()}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Dernières 24h</span>
        <span className="font-semibold text-primary-600 dark:text-primary-400">
          +{last24h}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Derniers 7 jours</span>
        <span className="font-semibold text-primary-600 dark:text-primary-400">
          +{last7days}
        </span>
      </div>
    </div>
  );
}
