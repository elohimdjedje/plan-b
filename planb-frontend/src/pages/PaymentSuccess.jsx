import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Crown, ArrowRight, Sparkles, Camera, Check, BarChart, Rocket, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import Button from '../components/common/Button';
import { createSubscription, formatEndDate } from '../utils/subscription';

/**
 * Page de confirmation de paiement réussi
 */
export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { upgradeToPro } = useAuthStore();

  // Récupérer les infos du paiement
  const months = parseInt(searchParams.get('months')) || 1;
  const amount = parseInt(searchParams.get('amount')) || 10000;

  useEffect(() => {
    // Créer l'abonnement avec la durée et le montant
    createSubscription(months, amount);
    
    // Mettre à jour le statut de l'utilisateur en PRO (pour compatibilité avec authStore)
    upgradeToPro();
    
    toast.success(`🎉 Félicitations ! Abonnement PRO ${months} mois activé !`);
  }, [upgradeToPro, months, amount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="max-w-md w-full"
      >
        {/* Animation de succès */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
            className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-4"
          >
            <CheckCircle2 size={48} className="text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-secondary-900 mb-2"
          >
            Paiement réussi !
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-secondary-600"
          >
            Votre compte a été mis à niveau avec succès
          </motion.p>
        </div>

        {/* Carte de confirmation */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-secondary-200"
        >
          {/* Badge PRO */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 mb-6 text-center">
            <Crown size={48} className="text-white mx-auto mb-2" />
            <h2 className="text-white text-2xl font-bold">Compte PRO</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Calendar size={16} className="text-white/90" />
              <p className="text-white/90 text-sm font-medium">
                {months} mois - {amount.toLocaleString()} FCFA
              </p>
            </div>
            <p className="text-white/80 text-xs mt-1">Actif dès maintenant</p>
          </div>

          {/* Avantages débloqués */}
          <div className="space-y-3 mb-8">
            <h3 className="font-semibold text-secondary-900 mb-4">Vos avantages :</h3>
            
            {[
              { icon: <Sparkles size={16} />, text: 'Annonces illimitées' },
              { icon: <Camera size={16} />, text: '10 photos par annonce' },
              { icon: <Check size={16} />, text: 'Badge vérifié PRO' },
              { icon: <BarChart size={16} />, text: 'Statistiques détaillées' },
              { icon: <Rocket size={16} />, text: 'Mise en avant automatique' },
              { icon: <Clock size={16} />, text: 'Durée illimitée' }
            ].map((avantage, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-3 text-secondary-700"
              >
                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 text-primary-600">
                  {avantage.icon}
                </div>
                <span>{avantage.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => navigate('/profile')}
              icon={<ArrowRight size={20} />}
            >
              Voir mon profil PRO
            </Button>
            
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('/publish')}
            >
              Créer une annonce
            </Button>
          </div>
        </motion.div>

        {/* Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-secondary-600 mt-6"
        >
          Un reçu a été envoyé à votre numéro Wave
        </motion.p>
      </motion.div>
    </div>
  );
}
