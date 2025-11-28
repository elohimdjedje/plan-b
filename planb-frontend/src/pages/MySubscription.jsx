import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Calendar, CreditCard, Lock, Unlock, AlertCircle, CheckCircle2 } from 'lucide-react';
import MobileContainer from '../components/layout/MobileContainer';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { 
  getSubscription, 
  getDaysRemaining, 
  canRenewSubscription, 
  formatEndDate,
  updateSubscriptionStatus,
  isSubscriptionActive
} from '../utils/subscription';
import { formatPrice } from '../utils/format';

/**
 * Page d'affichage de l'abonnement PRO actuel
 */
export default function MySubscription() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [canRenew, setCanRenew] = useState(false);

  useEffect(() => {
    // Mettre à jour le statut et récupérer l'abonnement
    const updatedSub = updateSubscriptionStatus();
    
    if (!updatedSub) {
      // Si pas d'abonnement ou expiré, rediriger vers upgrade
      navigate('/upgrade');
      return;
    }

    setSubscription(updatedSub);
    setDaysRemaining(getDaysRemaining());
    setCanRenew(canRenewSubscription());
  }, [navigate]);

  if (!subscription) {
    return null; // En cours de redirection
  }

  const handleRenew = () => {
    navigate('/upgrade');
  };

  const statusConfig = {
    active: {
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      icon: <CheckCircle2 size={20} className="text-green-600" />,
      label: 'Actif'
    },
    expiring_soon: {
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      icon: <AlertCircle size={20} className="text-orange-600" />,
      label: 'Expire bientôt'
    }
  };

  const currentStatus = statusConfig[subscription.status] || statusConfig.active;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-secondary-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-secondary-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold flex-1">Mon Abonnement</h1>
        </div>
      </div>

      <MobileContainer>
        <div className="max-w-md mx-auto px-4 pt-20 pb-24 space-y-4">
          {/* Statut de l'abonnement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Crown size={32} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">Compte PRO</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {currentStatus.icon}
                    <span className="text-sm font-medium">{currentStatus.label}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm opacity-90 mb-1">Expire le</div>
                    <div className="font-bold text-lg">{formatEndDate()}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90 mb-1">Jours restants</div>
                    <div className="font-bold text-lg">{daysRemaining} jours</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Alerte si expire bientôt */}
          {subscription.status === 'expiring_soon' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <GlassCard className="bg-orange-50 border-orange-200">
                <div className="flex gap-3">
                  <AlertCircle size={24} className="text-orange-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-1">
                      Votre abonnement expire dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
                    </h3>
                    <p className="text-sm text-orange-700">
                      Renouvelez maintenant pour continuer à profiter de tous les avantages PRO sans interruption.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Détails de l'abonnement */}
          <GlassCard>
            <h3 className="font-semibold text-lg mb-4">Détails de l'abonnement</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-secondary-100">
                <div className="flex items-center gap-2 text-secondary-600">
                  <Calendar size={18} />
                  <span>Durée</span>
                </div>
                <span className="font-semibold">{subscription.months} mois</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-secondary-100">
                <div className="flex items-center gap-2 text-secondary-600">
                  <CreditCard size={18} />
                  <span>Montant payé</span>
                </div>
                <span className="font-semibold">{formatPrice(subscription.price)} FCFA</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2 text-secondary-600">
                  <CheckCircle2 size={18} />
                  <span>Début</span>
                </div>
                <span className="font-semibold">
                  {new Date(subscription.startDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Avantages PRO */}
          <GlassCard>
            <h3 className="font-semibold text-lg mb-4">Vos avantages PRO</h3>
            <div className="space-y-3">
              {[
                'Annonces illimitées',
                'Badge vérifié et statistiques',
                'Mise en vedette gratuite',
                'Support prioritaire',
                'Visibilité accrue'
              ].map((advantage, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-green-600" />
                  </div>
                  <span className="text-secondary-700">{advantage}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Bouton renouveler */}
          <div className="pt-4">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleRenew}
              disabled={!canRenew}
              icon={canRenew ? <Unlock size={20} /> : <Lock size={20} />}
              className={!canRenew ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {canRenew ? 'Renouveler maintenant' : 'Renouvellement débloqué dans ' + (daysRemaining - 2) + ' jours'}
            </Button>

            {!canRenew && (
              <div className="mt-3 text-center">
                <p className="text-sm text-secondary-600">
                  <Lock size={14} className="inline mr-1" />
                  Le renouvellement sera disponible 2 jours avant l'expiration
                </p>
              </div>
            )}

            {canRenew && (
              <div className="mt-3 text-center">
                <p className="text-sm text-green-600 font-medium">
                  <Unlock size={14} className="inline mr-1" />
                  Vous pouvez renouveler votre abonnement dès maintenant
                </p>
              </div>
            )}
          </div>
        </div>
      </MobileContainer>
    </div>
  );
}
