import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';
import MobileContainer from '../components/layout/MobileContainer';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { getListingById, updateListing } from '../utils/listings';
import { toast } from 'react-hot-toast';

/**
 * Page de paiement pour modifier une annonce (FREE uniquement)
 */
export default function EditListingPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  
  const listingId = searchParams.get('listingId');
  const amount = parseInt(searchParams.get('amount')) || 1500;
  const listing = getListingById(listingId);

  useEffect(() => {
    if (!listingId || !listing) {
      toast.error('Annonce introuvable');
      navigate('/profile');
    }
  }, [listingId, listing, navigate]);

  const handlePayment = async () => {
    // Validation
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      toast.error('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setLoading(true);

    try {
      // Simuler le paiement Wave (remplacer par vraie API plus tard)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('✅ Paiement réussi ! Vous pouvez maintenant modifier votre annonce.');
      
      // Rediriger vers EditListing avec un paramètre "paid"
      setTimeout(() => {
        navigate(`/edit-listing/${listingId}?paid=true`);
      }, 1500);
    } catch (error) {
      console.error('Erreur paiement:', error);
      toast.error('Échec du paiement');
    } finally {
      setLoading(false);
    }
  };

  if (!listing) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-secondary-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(`/edit-listing/${listingId}`)}
            className="p-2 hover:bg-secondary-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold flex-1">Paiement modification</h1>
        </div>
      </div>

      <MobileContainer>
        <div className="max-w-md mx-auto px-4 pt-20 pb-24 space-y-4">
          {/* Récapitulatif */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className="bg-gradient-to-br from-orange-400 to-primary-500 text-white border-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Modification d'annonce</h2>
                  <p className="text-white/90 text-sm">Paiement unique</p>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-sm opacity-90 mb-1">Montant à payer</div>
                <div className="text-3xl font-bold">{amount.toLocaleString()} FCFA</div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Annonce concernée */}
          <GlassCard>
            <h3 className="font-semibold text-lg mb-3">Annonce à modifier</h3>
            <div className="flex gap-3 bg-secondary-50 rounded-xl p-3">
              {listing.image && (
                <img 
                  src={listing.image} 
                  alt={listing.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-secondary-900 line-clamp-2">
                  {listing.title}
                </h4>
                <p className="text-primary-500 font-bold text-sm mt-1">
                  {listing.price?.toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Paiement Wave */}
          <GlassCard>
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

              <div className="bg-blue-50/80 backdrop-blur-sm p-3 rounded-xl">
                <div className="flex gap-2 text-sm text-blue-800">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Paiement sécurisé</p>
                    <p className="text-xs">
                      Après validation du paiement, vous pourrez modifier votre annonce immédiatement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Info */}
          <GlassCard className="bg-green-50/80 border-green-200">
            <div className="text-center">
              <p className="text-sm text-green-800 font-medium mb-2">
                💡 Conseil : Passez en PRO !
              </p>
              <p className="text-xs text-green-700">
                Avec un compte PRO, modifiez gratuitement et sans limite toutes vos annonces.
              </p>
            </div>
          </GlassCard>

          {/* Bouton Payer */}
          <div className="pt-4">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handlePayment}
              disabled={loading || !phoneNumber}
            >
              {loading ? 'Traitement en cours...' : `Payer ${amount.toLocaleString()} FCFA`}
            </Button>
          </div>
        </div>
      </MobileContainer>
    </div>
  );
}
