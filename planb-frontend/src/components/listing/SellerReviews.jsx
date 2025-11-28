import { useState, useEffect } from 'react';
import { Star, User as UserIcon } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import ReviewStars from './ReviewStars';
import Avatar from '../common/Avatar';
import { formatRelativeDate } from '../../utils/format';
import axios from 'axios';

/**
 * Composant pour afficher les avis d'un vendeur avec sa note moyenne
 */
export default function SellerReviews({ sellerId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [sellerId]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/reviews/seller/${sellerId}`
      );
      
      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Erreur lors de la récupération des avis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <GlassCard>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </GlassCard>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Stats globales */}
      <GlassCard>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-secondary-900 mb-2">
              Avis des clients
            </h3>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-secondary-900">
                {stats.averageRating.toFixed(1)}
              </div>
              <div>
                <ReviewStars rating={Math.round(stats.averageRating)} size={20} />
                <p className="text-sm text-secondary-600 mt-1">
                  {stats.totalReviews} avis
                </p>
              </div>
            </div>
          </div>

          {/* Distribution des notes */}
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution[rating] || 0;
              const percentage = stats.totalReviews > 0 
                ? (count / stats.totalReviews) * 100 
                : 0;

              return (
                <div key={rating} className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-secondary-600">{rating} ★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-secondary-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Liste des avis */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.slice(0, 5).map((review) => (
            <GlassCard key={review.id} className="bg-white/50">
              <div className="flex gap-3">
                <Avatar
                  src={review.reviewer.profilePicture}
                  alt={review.reviewer.firstName}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-secondary-900">
                        {review.reviewer.firstName}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {formatRelativeDate(review.createdAt)}
                      </p>
                    </div>
                    <ReviewStars rating={review.rating} size={14} />
                  </div>

                  {review.comment && (
                    <p className="text-sm text-secondary-700 mb-2">
                      {review.comment}
                    </p>
                  )}

                  {review.listing && (
                    <div className="text-xs text-secondary-500 bg-secondary-50 rounded-lg px-2 py-1 inline-block">
                      📦 {review.listing.title}
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}

          {reviews.length > 5 && (
            <p className="text-sm text-center text-secondary-600">
              +{reviews.length - 5} autres avis
            </p>
          )}
        </div>
      )}
    </div>
  );
}
