import { useState, useEffect } from 'react';
import { Star, Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import GlassCard from '../common/GlassCard';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import api from '../../api/axios';
import { formatRelativeDate } from '../../utils/format';

/**
 * Section pour afficher et laisser des avis sur une annonce spécifique
 */
export default function ReviewSection({ listing, currentUser, sellerId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  // Charger les avis de l'annonce spécifique (pas du vendeur global)
  useEffect(() => {
    if (listing?.id) {
      loadReviews();
    }
  }, [listing?.id]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      // Charger les avis spécifiques à cette annonce
      const response = await api.get(`/reviews/listing/${listing.id}`);
      setReviews(response.data.reviews || []);
      setAverageRating(response.data.averageRating || 0);
    } catch (error) {
      console.error('Erreur chargement avis:', error);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si l'utilisateur peut laisser un avis
  const canReview = currentUser && currentUser.id !== sellerId;
  const hasReviewed = reviews.some(r => r.reviewer?.id === currentUser?.id);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/reviews', {
        listingId: listing.id,
        sellerId: sellerId,
        rating: rating,
        comment: comment.trim() || null,
        reviewType: 'transaction'
      });
      
      toast.success('Merci pour votre avis !');
      setShowForm(false);
      setRating(0);
      setComment('');
      loadReviews(); // Recharger les avis
    } catch (error) {
      console.error('Erreur soumission avis:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.error || 'Erreur lors de la soumission');
      } else {
        toast.error('Impossible de soumettre l\'avis');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Étoiles interactives pour la notation
  const StarRating = ({ value, onChange, hover, onHover, size = 24, interactive = true }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            onMouseEnter={() => interactive && onHover?.(star)}
            onMouseLeave={() => interactive && onHover?.(0)}
            className={`transition-transform ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              size={size}
              className={`transition-colors ${
                star <= (hover || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-secondary-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <GlassCard className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Avis sur cette annonce</h3>
        {averageRating > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(averageRating)} interactive={false} size={16} />
            <span className="font-medium text-secondary-900">{averageRating.toFixed(1)}</span>
            <span className="text-secondary-500 text-sm">({reviews.length} avis)</span>
          </div>
        )}
      </div>

      {/* Bouton pour laisser un avis */}
      {canReview && !hasReviewed && !showForm && (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          fullWidth
          className="mb-4"
        >
          <Star size={18} className="mr-2" />
          Laisser un avis
        </Button>
      )}

      {/* Message si déjà noté */}
      {hasReviewed && (
        <div className="bg-green-50 text-green-700 p-3 rounded-xl mb-4 text-sm">
          ✓ Vous avez déjà laissé un avis pour cette annonce
        </div>
      )}

      {/* Formulaire d'avis */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmitReview}
            className="bg-secondary-50 rounded-xl p-4 mb-4"
          >
            <h4 className="font-medium mb-3">Votre évaluation</h4>
            
            {/* Sélection des étoiles */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-secondary-600">Note :</span>
              <StarRating
                value={rating}
                onChange={setRating}
                hover={hoverRating}
                onHover={setHoverRating}
                size={28}
              />
              {rating > 0 && (
                <span className="text-sm font-medium text-primary-600">
                  {rating === 1 && 'Très mauvais'}
                  {rating === 2 && 'Mauvais'}
                  {rating === 3 && 'Moyen'}
                  {rating === 4 && 'Bon'}
                  {rating === 5 && 'Excellent'}
                </span>
              )}
            </div>

            {/* Commentaire */}
            <div className="mb-4">
              <label className="block text-sm text-secondary-600 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience avec ce vendeur..."
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-lg rounded-xl border-2 border-white/30 focus:border-primary-500/60 focus:outline-none transition-all duration-200 resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-secondary-500 text-right mt-1">
                {comment.length}/500
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setRating(0);
                  setComment('');
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={submitting || rating === 0}
                className="flex-1"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Envoi...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send size={16} />
                    Envoyer
                  </span>
                )}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Liste des avis */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.slice(0, 5).map((review) => (
            <div key={review.id} className="border-b border-secondary-100 last:border-0 pb-4 last:pb-0">
              <div className="flex items-start gap-3">
                <Avatar name={review.reviewer?.fullName || 'Anonyme'} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-secondary-900">
                      {review.reviewer?.firstName || 'Utilisateur'}
                    </span>
                    <StarRating value={review.rating} interactive={false} size={14} />
                  </div>
                  {review.comment && (
                    <p className="text-sm text-secondary-700 mb-1">{review.comment}</p>
                  )}
                  <span className="text-xs text-secondary-500">
                    {formatRelativeDate(review.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {reviews.length > 5 && (
            <button className="text-primary-600 text-sm font-medium hover:underline">
              Voir tous les avis ({reviews.length})
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-secondary-500">
          <Star size={32} className="mx-auto mb-2 text-secondary-300" />
          <p>Aucun avis pour le moment</p>
          {canReview && !showForm && (
            <p className="text-sm mt-1">Soyez le premier à donner votre avis !</p>
          )}
        </div>
      )}
    </GlassCard>
  );
}
