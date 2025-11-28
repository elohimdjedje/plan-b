import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RotateCcw, Lightbulb } from 'lucide-react';
import Button from '../components/common/Button';

/**
 * Page d'annulation de paiement
 */
export default function PaymentCancel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const months = searchParams.get('months') || '3';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="max-w-md w-full"
      >
        {/* Animation d'erreur */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
            className="inline-flex items-center justify-center w-24 h-24 bg-red-500 rounded-full mb-4"
          >
            <XCircle size={48} className="text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-secondary-900 mb-2"
          >
            Paiement annulé
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-secondary-600"
          >
            Votre paiement n'a pas été effectué
          </motion.p>
        </div>

        {/* Carte d'information */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-secondary-200"
        >
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-secondary-900 mb-2">
              Que s'est-il passé ?
            </h2>
            <p className="text-secondary-600 text-sm">
              Votre transaction a été annulée. Aucun montant n'a été débité de votre compte.
            </p>
          </div>

          {/* Raisons possibles */}
          <div className="bg-orange-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-orange-900 mb-3 text-sm">
              Raisons possibles :
            </h3>
            <ul className="space-y-2 text-sm text-orange-800">
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Annulation volontaire du paiement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Délai d'attente expiré</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Solde insuffisant</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Problème de connexion</span>
              </li>
            </ul>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => navigate(`/payment/wave?months=${months}`)}
              icon={<RotateCcw size={20} />}
            >
              Réessayer le paiement
            </Button>
            
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate('/profile')}
              icon={<ArrowLeft size={20} />}
            >
              Retour au profil
            </Button>
          </div>

          {/* Aide */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-900 font-medium mb-1 flex items-center gap-2">
              <Lightbulb size={18} />
              Besoin d'aide ?
            </p>
            <p className="text-xs text-blue-700">
              Si vous rencontrez des difficultés, n'hésitez pas à nous contacter via WhatsApp ou notre support client.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
