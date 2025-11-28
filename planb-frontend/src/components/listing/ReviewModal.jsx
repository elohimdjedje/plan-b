import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import Button from '../common/Button';
import Textarea from '../common/Textarea';
import ReviewStars from './ReviewStars';
import { toast } from 'react-hot-toast';
import axios from 'axios';

/**
 * Modal pour laisser un avis avec étoiles et commentaire
 */
export default function ReviewModal({ listing, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/reviews`,
        {
          listingId: listing.id,
          rating,
          comment: comment.trim() || null,
          reviewType: ['hotel', 'residence-meublee', 'vacances'].includes(listing.subcategory) 
            ? 'vacation' 
            : 'transaction'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Merci pour votre avis ! 🌟');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'avis:', error);
      
      if (error.response?.status === 401) {
        toast.error('Vous devez être connecté pour laisser un avis');
      } else if (error.response?.data?.error?.includes('déjà laissé')) {
        toast.error('Vous avez déjà laissé un avis pour cette annonce');
      } else if (error.response?.data?.error?.includes('propre annonce')) {
        toast.error('Vous ne pouvez pas noter votre propre annonce');
      } else {
        toast.error('Erreur lors de l\'envoi de votre avis');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard className="bg-white/95 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-secondary-900">
                Laisser un avis
              </h3>
              <p className="text-sm text-secondary-600 mt-1">
                {listing.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-secondary-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-secondary-900 mb-3">
                Votre note <span className="text-red-500">*</span>
              </label>
              <div className="flex justify-center py-4">
                <ReviewStars
                  rating={rating}
                  size={40}
                  interactive
                  onChange={setRating}
                />
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-secondary-600 mt-2">
                  {rating === 5 && '⭐ Excellent !'}
                  {rating === 4 && '👍 Très bien'}
                  {rating === 3 && '😊 Bien'}
                  {rating === 2 && '😐 Moyen'}
                  {rating === 1 && '😞 Décevant'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-secondary-900 mb-2">
                Commentaire <span className="text-secondary-500">(facultatif)</span>
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience avec cette annonce..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-secondary-500 mt-1 text-right">
                {comment.length}/500 caractères
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                fullWidth
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading || rating === 0}
                icon={<Star size={18} />}
              >
                {loading ? 'Envoi...' : 'Publier l\'avis'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
