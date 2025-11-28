import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Crown, Check, X, ArrowLeft,
  Image, TrendingUp, Shield, Zap,
  Award, BarChart, Lightbulb
} from 'lucide-react';
import MobileContainer from '../components/layout/MobileContainer';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';

/**
 * Page de sélection de plan (FREE vs PRO)
 */
export default function UpgradePlan() {
  const navigate = useNavigate();

  const plans = {
    FREE: {
      name: 'FREE',
      price: 0,
      period: 'Gratuit',
      color: 'from-gray-400 to-gray-600',
      features: [
        { text: '3 annonces maximum', included: true, icon: Image },
        { text: '3 photos par annonce', included: true, icon: Image },
        { text: 'Annonces expirent après 30 jours', included: true, icon: Zap, warning: true },
        { text: 'Modification : 1 500 FCFA', included: true, icon: Award, warning: true },
        { text: 'Republication : 1 500 FCFA', included: true, icon: Award, warning: true },
        { text: 'Badge vérifié PRO', included: false, icon: Shield },
        { text: 'Statistiques détaillées', included: false, icon: BarChart },
        { text: 'Modifications/Republications gratuites', included: false, icon: Award },
        { text: 'Durée illimitée', included: false, icon: Crown },
      ]
    },
    PRO: {
      name: 'PRO',
      price: 10000,
      period: 'par mois',
      color: 'from-yellow-400 to-orange-500',
      features: [
        { text: 'Annonces illimitées', included: true, icon: TrendingUp },
        { text: '10 photos par annonce', included: true, icon: Image },
        { text: 'Durée illimitée (pas d\'expiration)', included: true, icon: Crown },
        { text: 'Modifications gratuites illimitées', included: true, icon: Award },
        { text: 'Republication gratuite', included: true, icon: Award },
        { text: 'Badge vérifié PRO', included: true, icon: Shield },
        { text: 'Statistiques détaillées', included: true, icon: BarChart },
        { text: 'Mise en avant automatique', included: true, icon: Zap },
      ]
    }
  };

  return (
    <MobileContainer 
      headerProps={{ 
        showLogo: false, 
        title: 'Choisir un Plan',
        leftAction: (
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} className="text-secondary-900" />
          </button>
        )
      }}
    >
      <div className="space-y-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            Choisissez votre Plan
          </h1>
          <p className="text-secondary-600">
            Sélectionnez le plan qui correspond à vos besoins
          </p>
        </motion.div>

        {/* Plans */}
        <div className="space-y-4">
          {Object.entries(plans).map(([key, plan], index) => {
            const isPro = key === 'PRO';
            
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard
                  className={`
                    relative transition-all duration-300 hover:shadow-xl
                    ${isPro ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : ''}
                  `}
                  padding="p-0"
                >
                  {/* Badge recommandé */}
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Crown size={12} />
                        <span>RECOMMANDÉ</span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* En-tête */}
                    <div className={`bg-gradient-to-r ${plan.color} rounded-xl p-4 mb-6`}>
                      <div className="flex items-center justify-between text-white">
                        <div>
                          <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold">
                              {plan.price === 0 ? 'Gratuit' : `${plan.price.toLocaleString()} FCFA`}
                            </span>
                            {plan.price > 0 && (
                              <span className="text-sm opacity-90">/{plan.period}</span>
                            )}
                          </div>
                        </div>
                        {isPro && <Crown size={40} className="text-white/80" />}
                      </div>
                    </div>

                    {/* Caractéristiques */}
                    <div className="space-y-3">
                      {plan.features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                          <div 
                            key={idx}
                            className="flex items-center gap-3"
                          >
                            <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                              ${feature.included 
                                ? (feature.warning ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600')
                                : 'bg-red-100 text-red-600'
                              }
                            `}>
                              {feature.included ? (
                                <Check size={16} strokeWidth={3} />
                              ) : (
                                <X size={16} strokeWidth={3} />
                              )}
                            </div>
                            <span className={`text-sm ${
                              feature.included 
                                ? (feature.warning ? 'text-orange-700 font-medium' : 'text-secondary-900 font-medium')
                                : 'text-secondary-400'
                            }`}>
                              {feature.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bouton d'action */}
                    <div className="mt-6">
                      <Button
                        variant={isPro ? 'primary' : 'secondary'}
                        fullWidth
                        size="lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPro) {
                            navigate('/payment/wave?months=3');
                          } else {
                            navigate('/profile');
                          }
                        }}
                        icon={isPro ? <Crown size={20} /> : undefined}
                      >
                        {isPro ? 'Passer PRO maintenant' : 'Rester en FREE'}
                      </Button>
                      {isPro && (
                        <p className="text-center text-xs text-secondary-600 mt-2">
                          Paiement sécurisé via Wave
                        </p>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Info */}
        <GlassCard className="bg-blue-50/80 border-blue-200 mb-6">
          <div className="flex gap-3">
            <Lightbulb size={28} className="text-blue-500" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Pourquoi passer PRO ?</h4>
              <p className="text-sm text-blue-700">
                Les comptes PRO obtiennent 3x plus de visibilité et vendent 2x plus rapidement.
                Badge vérifié pour gagner la confiance des acheteurs !
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </MobileContainer>
  );
}
