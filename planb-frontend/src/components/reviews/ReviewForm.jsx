import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from '../../api/axios';
import Button from '../common/Button';

/**
 * Formulaire pour laisser un avis
 */
export default function ReviewForm({ listingId, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Veuillez donner une note');
            return;
        }

        setSubmitting(true);

        try {
            const response = await axios.post('/api/reviews', {
                listingId,
                rating,
                comment: comment.trim() || null
            });

            if (response.data.success) {
                toast.success('Avis publié avec succès !');
                setRating(0);
                setComment('');

                if (onSuccess) {
                    onSuccess(response.data.data);
                }
            }
        } catch (error) {
            console.error('Erreur publication avis:', error);

            if (error.response?.status === 409) {
                toast.error('Vous avez déjà laissé un avis sur cette annonce');
            } else if (error.response?.status === 403) {
                toast.error('Vous ne pouvez pas noter votre propre annonce');
            } else {
                toast.error(error.response?.data?.message || 'Erreur lors de la publication de l\'avis');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 border border-secondary-200">
            <h3 className="font-semibold text-lg mb-4">Laisser un avis</h3>

            {/* Étoiles */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Votre note *
                </label>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110"
                        >
                            <Star
                                size={32}
                                className={`transition-colors ${star <= (hoverRating || rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-secondary-300'
                                    }`}
                            />
                        </button>
                    ))}
                    {rating > 0 && (
                        <span className="ml-2 text-sm text-secondary-600">
                            {rating} étoile{rating > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Commentaire */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Votre commentaire (optionnel)
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Partagez votre expérience avec cette annonce..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-xl border-2 border-secondary-200 bg-white focus:border-primary-500 focus:outline-none transition-colors resize-none"
                />
                <p className="text-xs text-secondary-500 mt-1">
                    {comment.length}/500 caractères
                </p>
            </div>

            {/* Bouton */}
            <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={submitting || rating === 0}
                icon={<Send size={18} />}
            >
                {submitting ? 'Publication...' : 'Publier l\'avis'}
            </Button>
        </form>
    );
}
