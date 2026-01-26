import { useState } from 'react';
import { Star, Reply } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatRelativeDate } from '../../utils/format';
import { useAuthStore } from '../../store/authStore';
import axios from '../../api/axios';
import Button from '../common/Button';

/**
 * Item individuel d'avis
 */
export default function ReviewItem({ review, onReplyAdded }) {
    const { user } = useAuthStore();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isSeller = user && review.listing && user.id === review.listing.userId;

    const handleSubmitReply = async (e) => {
        e.preventDefault();

        if (!replyText.trim()) {
            toast.error('Veuillez saisir une réponse');
            return;
        }

        setSubmitting(true);

        try {
            const response = await axios.post(`/api/reviews/${review.id}/reply`, {
                response: replyText.trim()
            });

            if (response.data.success) {
                toast.success('Réponse publiée !');
                setShowReplyForm(false);
                setReplyText('');

                if (onReplyAdded) {
                    onReplyAdded(review.id, replyText.trim());
                }
            }
        } catch (error) {
            console.error('Erreur publication réponse:', error);
            toast.error(error.response?.data?.message || 'Erreur lors de la publication');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-5">
            {/* En-tête */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                        {review.reviewer.initials}
                    </div>

                    {/* Info */}
                    <div>
                        <p className="font-medium text-secondary-900">
                            {review.reviewer.name}
                        </p>
                        <p className="text-xs text-secondary-500">
                            {formatRelativeDate(review.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Étoiles */}
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={16}
                            className={star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-secondary-300'
                            }
                        />
                    ))}
                </div>
            </div>

            {/* Commentaire */}
            {review.comment && (
                <p className="text-secondary-700 mb-3 leading-relaxed">
                    {review.comment}
                </p>
            )}

            {/* Réponse du vendeur */}
            {review.sellerResponse && (
                <div className="mt-3 p-3 bg-primary-50 rounded-lg border-l-4 border-primary-500">
                    <div className="flex items-center gap-2 mb-2">
                        <Reply size=
                            {16} className="text-primary-600" />
                        <span className="text-sm font-medium text-primary-900">
                            Réponse du vendeur
                        </span>
                        <span className="text-xs text-primary-600">
                            {formatRelativeDate(review.respondedAt)}
                        </span>
                    </div>
                    <p className="text-sm text-primary-800">
                        {review.sellerResponse}
                    </p>
                </div>
            )}

            {/* Bouton répondre (vendeur seulement) */}
            {isSeller && !review.sellerResponse && (
                <div className="mt-3">
                    {!showReplyForm ? (
                        <button
                            onClick={() => setShowReplyForm(true)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
                        >
                            <Reply size={16} />
                            Répondre
                        </button>
                    ) : (
                        <form onSubmit={handleSubmitReply} className="space-y-3">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Écrivez votre réponse..."
                                rows={3}
                                maxLength={300}
                                className="w-full px-3 py-2 rounded-lg border-2 border-secondary-200 focus:border-primary-500 focus:outline-none transition-colors resize-none text-sm"
                                autoFocus
                            />
                            <div className="flex items-center gap-2">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Publication...' : 'Publier'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowReplyForm(false);
                                        setReplyText('');
                                    }}
                                >
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
