import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import pwaService from '../../services/pwa';

export default function InstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Initialiser le service PWA
    pwaService.initialize();

    // Vérifier si on peut installer
    const checkInstallable = () => {
      const can = pwaService.canInstall();
      const installed = pwaService.getInstalled();
      
      if (can && !installed) {
        // Vérifier si l'utilisateur a déjà dismiss le prompt
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

        if (!dismissed || dismissedTime < oneDayAgo) {
          setCanInstall(true);
          setIsVisible(true);
        }
      } else {
        setCanInstall(false);
        setIsVisible(false);
      }
    };

    // Vérifier immédiatement
    checkInstallable();

    // Écouter les événements
    const unsubscribe = pwaService.on('installable', checkInstallable);
    pwaService.on('installed', () => {
      setIsVisible(false);
      setCanInstall(false);
    });

    // Vérifier périodiquement
    const interval = setInterval(checkInstallable, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleInstall = async () => {
    const success = await pwaService.promptInstall();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setCanInstall(false);
  };

  if (!isVisible || !canInstall) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 md:p-5">
          <div className="flex items-start gap-3">
            {/* Icône */}
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Smartphone className="text-white" size={24} />
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">
                Installer Plan B
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Installez l'application pour un accès rapide et une meilleure expérience.
              </p>

              {/* Boutons */}
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
                >
                  <Download size={16} />
                  Installer
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Fermer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}


