import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Shield, Clock, CheckCircle2,
  Smartphone, CreditCard, AlertCircle, Crown, Sparkles, Star, RefreshCw
} from 'lucide-react';
import MobileContainer from '../components/layout/MobileContainer';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { toast } from 'react-hot-toast';

// Plans avec réductions (à partir de 9 mois) - Constant en dehors du composant
const PRICING_PLANS = {
  1: { months: 1, totalPrice: 10000, discount: 0, label: '1 mois' },
  2: { months: 2, totalPrice: 20000, discount: 0, label: '2 mois' },
  3: { months: 3, totalPrice: 30000, discount: 0, label: '3 mois' },
  4: { months: 4, totalPrice: 40000, discount: 0, label: '4 mois' },
  5: { months: 5, totalPrice: 50000, discount: 0, label: '5 mois' },
  6: { months: 6, totalPrice: 60000, discount: 0, label: '6 mois' },
  7: { months: 7, totalPrice: 70000, discount: 0, label: '7 mois' },
  8: { months: 8, totalPrice: 80000, discount: 0, label: '8 mois' },
  9: { months: 9, totalPrice: 80000, discount: 10000, label: '9 mois' },
  10: { months: 10, totalPrice: 88500, discount: 11500, label: '10 mois' },
  11: { months: 11, totalPrice: 97000, discount: 13000, label: '11 mois' },
  12: { months: 12, totalPrice: 105000, discount: 15000, label: '12 mois' }
};

/**
 * Page de paiement Wave (Style glassmorphism)
 */
export default function WavePayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error
  
  // Vérifier si c'est un renouvellement (depuis navigation state)
  const isRenewal = location.state?.isRenewal || false;
  
  // Récupérer selectedMonths depuis l'URL ou utiliser 1 par défaut (ou 1 pour renouvellement)
  const [selectedMonths, setSelectedMonths] = useState(() => {
    if (isRenewal) return 1; // Renouvellement = 1 mois par défaut
    return parseInt(searchParams.get('months')) || 1;
  });

  // Synchroniser selectedMonths avec l'URL au montage initial uniquement
  useEffect(() => {
    const urlMonths = parseInt(searchParams.get('months'));
    if (urlMonths && urlMonths !== selectedMonths) {
      console.log('📡 Initialisation depuis URL:', urlMonths, 'mois');
      setSelectedMonths(urlMonths);
    }
  }, []); // Exécuter une seule fois au montage

  const monthlyPrice = 10000; // Prix par mois
  
  // Calcul direct du prix sans état séparé
  const selectedPlan = PRICING_PLANS[selectedMonths];
  const planPrice = selectedPlan ? selectedPlan.totalPrice : 10000;
  
  // Debug
  console.log('🔍 selectedMonths:', selectedMonths, '| planPrice:', planPrice);

  const handlePayment = async () => {
    // Validation du numéro (accepter 9 à 15 caractères pour supporter différents formats)
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      toast.error('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    // Logs de débogage
    console.log('💰 Paiement initié:');
    console.log('  - Durée sélectionnée:', selectedMonths, 'mois');
    console.log('  - Plan:', selectedPlan);
    console.log('  - Montant à débiter:', planPrice, 'FCFA');
    console.log('  - Numéro Wave:', phoneNumber);

    setLoading(true);
    setPaymentStatus('processing');

    try {
      // OPTION 1: Redirection vers Wave (Simple et rapide)
      // Votre lien Wave avec paramètres
      const wavePaymentLink = 'https://pay.wave.com/m/M_qMsEKvTXZo-1';
      
      // Paramètres à ajouter à l'URL
      const params = new URLSearchParams({
        amount: planPrice,
        phone: cleanPhone,
        currency: 'XOF',
        description: `Abonnement PRO ${selectedPlan.label}`,
        // URL de retour après paiement avec infos
        return_url: `${window.location.origin}/payment/success?months=${selectedMonths}&amount=${planPrice}`,
        cancel_url: `${window.location.origin}/payment/cancel?months=${selectedMonths}`
      });

      const finalUrl = `${wavePaymentLink}?${params.toString()}`;
      console.log('🔗 URL de paiement Wave:', finalUrl);
      
      // Afficher une notification avec le montant
      toast.success(`Redirection vers Wave pour ${planPrice.toLocaleString()} FCFA`, { duration: 2000 });
      
      // Attendre un peu avant la redirection pour voir le toast
      setTimeout(() => {
        window.location.href = finalUrl;
      }, 1000);

      // OPTION 2: Appel API Backend (Plus avancé)
      // Décommentez si vous avez un backend
      // const response = await fetch('http://localhost:8000/api/payment/wave/init', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     phoneNumber,
      //     amount: planPrice,
      //     months: selectedMonths,
      //     currency: 'XOF'
      //   })
      // });
      // const data = await response.json();
      // 
      // if (data.payment_url) {
      //   window.location.href = data.payment_url;
      // }
      
    } catch (error) {
      setPaymentStatus('error');
      toast.error('Échec du paiement');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Fond animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-primary-300/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-blue-300/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <MobileContainer 
        headerProps={{ 
          showLogo: false, 
          title: '',
          leftAction: (
            <button 
              onClick={() => navigate(isRenewal ? '/my-subscription' : '/upgrade')}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
            >
              <ArrowLeft size={24} className="text-secondary-900" />
            </button>
          ),
          transparent: true
        }}
      >
        <div className="space-y-6 pb-24 relative z-10">
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              {isRenewal ? <RefreshCw size={40} className="text-white" /> : <Crown size={40} className="text-white" />}
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">
              {isRenewal ? 'Renouvellement PRO' : 'Paiement Compte PRO'}
            </h1>
            <p className="text-secondary-600">
              {isRenewal ? 'Prolongez votre abonnement PRO' : 'Déverrouillez toutes les fonctionnalités'}
            </p>
          </motion.div>

          {/* Message info renouvellement */}
          {isRenewal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Continuité garantie</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Votre nouvel abonnement démarrera automatiquement 30 minutes après l'expiration de l'abonnement actuel.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {paymentStatus === 'idle' || paymentStatus === 'error' ? (
              <motion.div
                key="payment-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Récapitulatif */}
                <GlassCard className="bg-white/60 backdrop-blur-xl border-white/20 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Crown size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-secondary-900">Compte PRO</h2>
                      <p className="text-sm text-secondary-600">Déverrouillez toutes les fonctionnalités</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Sélection durée */}
                    <div className="pb-4 border-b border-secondary-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-secondary-700">
                          Durée de l'abonnement
                        </label>
                        {selectedPlan.discount > 0 && (
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                            <Sparkles size={12} />
                            -{selectedPlan.discount.toLocaleString()} FCFA
                          </span>
                        )}
                      </div>
                      <select
                        value={selectedMonths}
                        onChange={(e) => {
                          const newMonths = Number(e.target.value);
                          console.log('📅 Durée changée:', newMonths, 'mois');
                          // Mettre à jour le state ET l'URL immédiatement pour une réactivité instantanée
                          setSelectedMonths(newMonths);
                          setSearchParams({ months: newMonths.toString() });
                        }}
                        className="w-full px-4 py-3 rounded-xl border-2 border-secondary-200 bg-white focus:border-primary-500 focus:outline-none transition-colors font-medium text-secondary-900"
                      >
                        {Object.values(PRICING_PLANS).map(plan => (
                          <option key={plan.months} value={plan.months}>
                            {plan.label} {plan.discount > 0 && `✨ -${plan.discount.toLocaleString()} FCFA`}
                          </option>
                        ))}
                      </select>
                      {selectedMonths === 12 && (
                        <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                          <Star size={14} className="fill-green-600" />
                          Meilleure offre - Économisez 15 000 FCFA !
                        </p>
                      )}
                    </div>

                    {/* Détails prix */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary-600">Prix mensuel</span>
                        <span className="font-medium text-secondary-900">10 000 FCFA</span>
                      </div>
                      
                      {selectedPlan.discount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <Sparkles size={16} />
                            Réduction spéciale
                          </span>
                          <span className="font-bold text-green-600">
                            -{selectedPlan.discount.toLocaleString()} FCFA
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t-2 border-secondary-200">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-secondary-900">Total à payer</span>
                        <div className="text-right">
                          <span className="text-3xl font-bold text-primary-600">
                            {planPrice.toLocaleString()}
                          </span>
                          <span className="text-primary-600 ml-1">FCFA</span>
                          {selectedPlan.discount > 0 && (
                            <p className="text-xs text-green-600 font-medium mt-1">
                              Vous économisez {selectedPlan.discount.toLocaleString()} FCFA !
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Méthode de paiement */}
                <GlassCard className="bg-white/60 backdrop-blur-xl border-white/20 shadow-2xl">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Smartphone size={20} className="text-primary-500" />
                    Paiement Wave
                  </h3>
                  
                  <div className="space-y-4">
                    <Input
                      label="Numéro de téléphone Wave"
                      type="tel"
                      placeholder="Ex: 0707123456"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      icon={<Smartphone size={18} />}
                    />

                    {/* Infos Wave */}
                    <div className="bg-blue-50/80 backdrop-blur-sm p-3 rounded-xl">
                      <div className="flex gap-2 text-sm text-blue-800">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium mb-1">Comment ça marche ?</p>
                          <ol className="space-y-1 text-xs">
                            <li>1. Entrez votre numéro Wave</li>
                            <li>2. Validez avec votre code PIN Wave</li>
                            <li>3. Votre compte devient PRO instantanément</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Garanties */}
                <GlassCard className="bg-white/60 backdrop-blur-xl border-white/20">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Shield size={24} className="mx-auto text-green-500 mb-2" />
                      <p className="text-xs text-secondary-700 font-medium">Paiement sécurisé</p>
                    </div>
                    <div>
                      <Clock size={24} className="mx-auto text-blue-500 mb-2" />
                      <p className="text-xs text-secondary-700 font-medium">Activation instantanée</p>
                    </div>
                    <div>
                      <CreditCard size={24} className="mx-auto text-purple-500 mb-2" />
                      <p className="text-xs text-secondary-700 font-medium">Sans engagement</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ) : paymentStatus === 'processing' ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12"
              >
                <GlassCard className="bg-white/60 backdrop-blur-xl border-white/20 text-center">
                  <div className="animate-spin w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-secondary-900 mb-2">
                    Traitement en cours...
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    Veuillez valider le paiement sur votre téléphone Wave
                  </p>
                  <div className="bg-yellow-50/80 backdrop-blur-sm p-3 rounded-xl">
                    <p className="text-sm text-yellow-800">
                      ⏱️ En attente de confirmation Wave
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-12"
              >
                <GlassCard className="bg-white/60 backdrop-blur-xl border-white/20 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={40} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-900 mb-2">
                    Paiement réussi !
                  </h3>
                  <p className="text-secondary-600 mb-4">
                    Votre compte PRO est maintenant actif
                  </p>
                  <div className="bg-green-50/80 backdrop-blur-sm p-4 rounded-xl">
                    <div className="flex items-center justify-center gap-2 text-green-800">
                      <Crown size={20} />
                      <span className="font-semibold">Bienvenue parmi les PRO !</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bouton de paiement */}
        {(paymentStatus === 'idle' || paymentStatus === 'error') && (
          <div className="pb-6">
            <div className="max-w-md mx-auto space-y-3">
              {/* Indication du montant total */}
              <div className="bg-gradient-to-r from-primary-500 to-orange-500 rounded-2xl p-4 text-center text-white shadow-lg">
                <p className="text-sm font-medium mb-1">Montant à payer</p>
                <p className="text-4xl font-bold">
                  {planPrice.toLocaleString()}
                  <span className="text-xl ml-2">FCFA</span>
                </p>
                <p className="text-sm opacity-90 mt-1">
                  pour {selectedMonths} mois d'abonnement PRO
                </p>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handlePayment}
                disabled={loading || !phoneNumber}
                icon={<Shield size={20} />}
              >
                {loading ? 'Redirection vers Wave...' : 'Payer'}
              </Button>
              <p className="text-center text-xs text-secondary-500">
                En continuant, vous acceptez nos conditions d'utilisation
              </p>
            </div>
          </div>
        )}
      </MobileContainer>
    </div>
  );
}
