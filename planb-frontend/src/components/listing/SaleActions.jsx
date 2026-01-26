import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MessageSquare, DollarSign, Lock, Phone, 
  Send, X, Loader2, Check, AlertCircle, Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { offersAPI } from '../../api/offers';
import useAuthStore from '../../store/authStore';

/**
 * Actions pour les biens en VENTE (voiture, maison, terrain)
 * - Demander une visite
 * - Faire une offre
 * - Réserver avec acompte
 * - Contacter le vendeur
 */
export default function SaleActions({ 
  listing, 
  onVisitRequest,
  onOfferSent,
  className = '' 
}) {
  const { user } = useAuthStore();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerData, setOfferData] = useState({
    amount: '',
    message: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const isOwner = user?.id === listing?.user?.id;
  const isSold = listing?.status === 'sold';
  const isReserved = listing?.status === 'reserved';

  // Statut badge
  const getStatusBadge = () => {
    switch (listing?.status) {
      case 'sold':
        return { color: 'bg-red-500', text: '🔴 Vendu', icon: null };
      case 'reserved':
        return { color: 'bg-blue-500', text: '🔵 Réservé', icon: Lock };
      case 'negotiation':
        return { color: 'bg-yellow-500', text: '🟡 En négociation', icon: null };
      default:
        return { color: 'bg-green-500', text: '🟢 Disponible', icon: Check };
    }
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Connectez-vous pour faire une offre');
      return;
    }

    if (!offerData.amount || parseFloat(offerData.amount) <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }

    setSubmitting(true);
    try {
      const result = await offersAPI.create(
        listing.id,
        offerData.amount,
        offerData.message || null,
        offerData.phone || null
      );
      
      toast.success('Offre envoyée avec succès !');
      setShowOfferModal(false);
      setOfferData({ amount: '', message: '', phone: '' });
      
      if (onOfferSent) onOfferSent(result);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi de l\'offre');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const statusBadge = getStatusBadge();

  if (isOwner) {
    return null; // Le propriétaire ne voit pas ces boutons
  }

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden ${className}`}>
      {/* En-tête avec statut */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-lg">Actions</h3>
          <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${statusBadge.color}`}>
            {statusBadge.text}
          </span>
        </div>
        <p className="text-gray-400 text-sm mt-1">
          Prix demandé : <span className="text-orange-400 font-bold">{formatPrice(listing?.price)} {listing?.currency}</span>
        </p>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        {/* Demander une visite */}
        <button
          onClick={onVisitRequest}
          disabled={isSold}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-500/20 disabled:cursor-not-allowed border border-blue-500/30 rounded-xl text-blue-400 disabled:text-gray-500 font-medium transition-all"
        >
          <Eye className="w-5 h-5" />
          <span>Demander une visite</span>
        </button>

        {/* Faire une offre */}
        <button
          onClick={() => setShowOfferModal(true)}
          disabled={isSold || isReserved}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500/50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all"
        >
          <DollarSign className="w-5 h-5" />
          <span>Faire une offre</span>
        </button>

        {/* Réserver avec acompte */}
        <button
          disabled={isSold || isReserved}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-purple-500/20 hover:bg-purple-500/30 disabled:bg-gray-500/20 disabled:cursor-not-allowed border border-purple-500/30 rounded-xl text-purple-400 disabled:text-gray-500 font-medium transition-all"
        >
          <Lock className="w-5 h-5" />
          <span>Réserver avec acompte</span>
        </button>

        {/* Messages d'information */}
        {isSold && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">Ce bien a été vendu</span>
          </div>
        )}

        {isReserved && !isSold && (
          <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Lock className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 text-sm">Ce bien est actuellement réservé</span>
          </div>
        )}
      </div>

      {/* Modal Offre d'achat */}
      <AnimatePresence>
        {showOfferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOfferModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-secondary-800 rounded-2xl p-6 w-full max-w-md border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">💰 Faire une offre</h3>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Info prix */}
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <p className="text-gray-400 text-sm">Prix demandé</p>
                <p className="text-2xl font-bold text-orange-400">
                  {formatPrice(listing?.price)} {listing?.currency}
                </p>
                <p className="text-gray-500 text-sm mt-1">{listing?.title}</p>
              </div>

              <form onSubmit={handleOfferSubmit} className="space-y-4">
                {/* Montant offre */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Votre offre (XOF) *
                  </label>
                  <input
                    type="number"
                    value={offerData.amount}
                    onChange={e => setOfferData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Ex: 120000000"
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                  {offerData.amount && (
                    <p className="text-sm text-gray-400 mt-1">
                      = {formatPrice(offerData.amount)} XOF
                      {listing?.price && (
                        <span className={`ml-2 ${parseFloat(offerData.amount) < parseFloat(listing.price) ? 'text-red-400' : 'text-green-400'}`}>
                          ({((parseFloat(offerData.amount) / parseFloat(listing.price)) * 100 - 100).toFixed(1)}%)
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Votre téléphone
                  </label>
                  <input
                    type="tel"
                    value={offerData.phone}
                    onChange={e => setOfferData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Ex: 07 00 00 00 00"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Message (optionnel)
                  </label>
                  <textarea
                    value={offerData.message}
                    onChange={e => setOfferData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Ajoutez un message pour le vendeur..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowOfferModal(false)}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !offerData.amount}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Envoyer l'offre
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
