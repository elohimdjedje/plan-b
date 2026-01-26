import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import pushNotificationService from '../../services/pushNotification';
import { useAuthStore } from '../../store/authStore';

/**
 * Composant pour demander la permission de notifications push
 */
export default function PushNotificationPrompt() {
  const { user } = useAuthStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkSubscription = async () => {
      try {
        const subscribed = await pushNotificationService.isSubscribed();
        setIsSubscribed(subscribed);

        // Afficher le prompt si pas encore abonné et permission non refusée
        const permission = pushNotificationService.getPermission();
        if (!subscribed && permission === 'default') {
          // Attendre 3 secondes avant d'afficher le prompt
          setTimeout(() => {
            setShowPrompt(true);
          }, 3000);
        }
      } catch (error) {
        console.error('Error checking push subscription:', error);
      }
    };

    checkSubscription();
  }, [user]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await pushNotificationService.subscribe();
      setIsSubscribed(true);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      alert('Erreur lors de l\'activation des notifications. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Ne plus afficher pendant cette session
    sessionStorage.setItem('push_prompt_dismissed', 'true');
  };

  // Ne pas afficher si déjà abonné ou si refusé
  if (isSubscribed || !showPrompt) {
    return null;
  }

  // Ne pas afficher si déjà refusé dans cette session
  if (sessionStorage.getItem('push_prompt_dismissed') === 'true') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 right-4 z-50 max-w-sm"
      >
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Activer les notifications
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Recevez des notifications instantanées pour vos messages, favoris et annonces.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Activation...' : 'Activer'}
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm"
                >
                  Plus tard
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}


