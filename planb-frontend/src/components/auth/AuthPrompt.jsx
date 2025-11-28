import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

/**
 * Modale invitant l'utilisateur à se connecter ou s'inscrire
 */
export default function AuthPrompt({ isOpen, onClose, message }) {
  const navigate = useNavigate();

  const handleSignup = () => {
    onClose();
    navigate('/auth', { state: { tab: 'signup' } });
  };

  const handleLogin = () => {
    onClose();
    navigate('/auth', { state: { tab: 'login' } });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modale */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Connexion requise</h2>
                    <p className="text-white/80 text-sm">Créez un compte pour continuer</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-600 text-center mb-6">
                  {message || "Pour accéder à cette fonctionnalité, vous devez être connecté."}
                </p>

                <div className="space-y-3">
                  {/* Bouton S'inscrire */}
                  <Button
                    onClick={handleSignup}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                  >
                    <UserPlus size={20} />
                    S'inscrire gratuitement
                  </Button>

                  {/* Bouton Se connecter */}
                  <Button
                    onClick={handleLogin}
                    variant="outline"
                    className="w-full border-2 border-primary text-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/5 transition-all"
                  >
                    <LogIn size={20} />
                    Se connecter
                  </Button>
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">
                  En créant un compte, vous acceptez nos conditions d'utilisation
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
