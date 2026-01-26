import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import axios from '../../api/axios';
import ReviewItem from './ReviewItem';
import PlanBLoader from '../animations/PlanBLoader';

/**
 * Liste des avis d'un vendeur
 */
export default function ReviewList({ sellerId }) {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, [sellerId]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/reviews/seller/${sellerId}`);

            if (response.data.success) {
                setReviews(response.data.data.reviews);
                setStats(response.data.data.stats);
            }
        } catch (error) {
            console.error('Erreur chargement avis:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReplyAdded = (reviewId, reply) => {
        setReviews(reviews.map(r =>
            r.id === reviewId
                ? { ...r, sellerResponse: reply, respondedAt: new Date().toISOString() }
                : r
        ));
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-8 border border-secondary-200">
                <PlanBLoader />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Statistiques */}
            {stats && stats.totalReviews > 0 && (
                <div className="bg-white rounded-xl p-5 border border-secondary-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Note globale</h3>
                        <div className="flex items-center gap-2">
                            <Star size={24} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</span>
                            <span className="text-sm text-secondary-600">/ 5</span>
                        </div>
                    </div>

                    <p className="text-sm text-secondary-600 mb-4">
                        Basé sur {stats.totalReviews} avis
                    </p>

                    {/* Répartition des notes */}
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = stats[`rating${rating}Count`] || 0;
                            const percentage = stats.totalReviews > 0
                                ? (count / stats.totalReviews) * 100
                                : 0;

                            return (
                                <div key={rating} className="flex items-center gap-2">
                                    <span className="text-sm w-8">{rating} ★</span>
                                    <div className="flex-1 h-2 bg-secondary-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-secondary-600 w-8">
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Liste des avis */}
            <div className="bg-white rounded-xl border border-secondary-200">
                <div className="p-5 border-b border-secondary-200">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <MessageSquare size={20} />
                        Avis ({reviews.length})
                    </h3>
                </div>

                {reviews.length === 0 ? (
                    <div className="p-8 text-center text-secondary-600">
                        <Star size={48} className="mx-auto mb-3 opacity-30" />
                        <p>Aucun avis pour le moment</p>
                    </div>
                ) : (
                    <div className="divide-y divide-secondary-100">
                        {reviews.map((review) => (
                            <ReviewItem
                                key={review.id}
                                review={review}
                                onReplyAdded={handleReplyAdded}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
