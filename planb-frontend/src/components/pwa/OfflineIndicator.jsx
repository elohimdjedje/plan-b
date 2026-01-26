import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import pwaService from '../../services/pwa';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!pwaService.isOnlineStatus());
  const [showOnlineBanner, setShowOnlineBanner] = useState(true);

  useEffect(() => {
    const unsubscribeOnline = pwaService.on('online', () => {
      setIsOffline(false);
      setShowOnlineBanner(true);
    });

    const unsubscribeOffline = pwaService.on('offline', () => {
      setIsOffline(true);
    });

    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, []);

  // Masquer la bannière verte après 3 secondes
  useEffect(() => {
    if (showOnlineBanner && !isOffline) {
      const timer = setTimeout(() => {
        setShowOnlineBanner(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showOnlineBanner, isOffline]);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff size={16} />
            <span>Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.</span>
          </div>
        </motion.div>
      )}
      {!isOffline && showOnlineBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-2 text-center text-sm font-medium"
        >
          <div className="flex items-center justify-center gap-2">
            <Wifi size={16} />
            <span>Vous êtes de nouveau en ligne.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


