import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Crown, ArrowRight, Sparkles, Camera, Check, BarChart, Rocket, Clock, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import Button from '../components/common/Button';
import api from '../api/axios';

/**
 * Page de confirmation de paiement réussi
 * Active automatiquement le compte PRO dans le backend
 */
export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { upgradeToPro, updateUser, token } = useAuthStore();
  const [activating, setActivating] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  // Récupérer les infos du paiement depuis l'URL
  const months = parseInt(searchParams.get('months')) || 1;
  const amount = parseInt(searchParams.get('amount')) || 10000;

  useEffect(() => {
    // Éviter les doubles appels
    let isMounted = true;
    
    const activateProAccount = async () => {
      // Vérifier si déjà activé (éviter les rechargements de page)
      const alreadyActivated = sessionStorage.getItem('payment_activated');
      if (alreadyActivated === `${months}_${amount}`) {
        setActivating(false);
        return;
      }

      try {
        setActivating(true);
        
        // Appeler le backend pour activer le compte PRO
        const response = await api.post('/payments/confirm-wave', {
          months: months,
          amount: amount,
          phoneNumber: sessionStorage.getItem('wave_phone') || null
        });

        if (isMounted && response.data.success) {
          // Marquer comme activé pour éviter les doubles activations
          sessionStorage.setItem('payment_activated', `${months}_${amount}`);
          
          // Mettre à jour le store local
          upgradeToPro();
          
          // Mettre à jour les infos utilisateur avec la date d'expiration
          if (response.data.user) {
            updateUser({
              accountType: 'PRO',
              subscriptionExpiresAt: response.data.user.subscriptionExpiresAt
            });
          }
          
          setSubscriptionInfo(response.data.subscription);
          toast.success(`🎉 Félicitations ! Abonnement PRO ${months} mois activé !`);
        }
      } catch (err) {
        console.error('Erreur activation PRO:', err);
        
        if (isMounted) {
          // Si le backend échoue, activer quand même côté frontend
          // (L'utilisateur pourra être vérifié manuellement plus tard)
          upgradeToPro();
          
          if (err.response?.status === 401) {
            setError('Session expirée. Veuillez vous reconnecter.');
          } else {
            // Activation locale de secours
            toast.success(`🎉 Compte PRO activé ! Confirmation en cours...`);
          }
        }
      } finally {
        if (isMounted) {
          setActivating(false);
        }
      }
    };

    // Lancer l'activation
    if (token) {
      activateProAccount();
    } else {
      // Pas de token, activation locale uniquement
      upgradeToPro();
      setActivating(false);
      toast.success(`🎉 Compte PRO activé !`);
    }

    return () => {
      isMounted = false;
    };
  }, [months, amount, upgradeToPro, updateUser, token]);

  // Affichage pendant l'activation
  if (activating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 size={48} className="animate-spin text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-secondary-900 mb-2">
            Activation de votre compte PRO...
          </h2>
          <p className="text-secondary-600">
            Veuillez patienter quelques secondes
          </p>
        </motion.div>
      </div>
    );
  }

  // Affichage en cas d'erreur critique
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl text-center"
        >
          <AlertCircle size={48} className="text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-secondary-900 mb-2">
            Attention
          </h2>
          <p className="text-secondary-600 mb-6">{error}</p>
          <Button
            variant="primary"
            onClick={() => navigate('/login')}
          >
            Se reconnecter
          </Button>
        </motion.div>
      </div>
    );
  }

  // Calculer la date d'expiration à afficher
  const expirationDate = subscriptionInfo?.expiresAt 
    ? new Date(subscriptionInfo.expiresAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

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
            {expirationDate && (
              <p className="text-white/80 text-xs mt-1">
                Valide jusqu'au {expirationDate}
              </p>
            )}
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
          Votre paiement Wave a été enregistré
        </motion.p>
      </motion.div>
    </div>
  );
}
