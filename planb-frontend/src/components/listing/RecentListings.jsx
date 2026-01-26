import { useState, useEffect, useCallback } from 'react';
import { Clock, Zap, Crown, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatRelativeDate } from '../../utils/format';
import { getImageUrl, IMAGE_PLACEHOLDER } from '../../utils/images';
import { listingsAPI } from '../../api/listings';

/**
 * Section Annonces Récentes - Toutes les annonces de moins de 3 jours
 * Affiche les annonces FREE et PRO publiées il y a moins de 3 jours
 */
export default function RecentListings({ activeCategory = 'all' }) {
    const navigate = useNavigate();
    const [recentListings, setRecentListings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Précharger une annonce au survol
    const handlePrefetch = useCallback((id) => {
        listingsAPI.prefetchListing(id);
    }, []);

    useEffect(() => {
        loadRecentListings();
    }, [activeCategory]);

    const loadRecentListings = async () => {
        try {
            setLoading(true);
            const response = await listingsAPI.getRecentListings({
                limit: 15,
                category: activeCategory !== 'all' ? activeCategory : undefined
            });
            const listings = response.data || [];
            setRecentListings(listings);
        } catch (error) {
            console.error('Erreur chargement annonces récentes:', error);
            setRecentListings([]);
        } finally {
            setLoading(false);
        }
    };

    // Calculer les heures restantes (3 jours = 72h)
    const getHoursRemaining = (createdAt) => {
        const created = new Date(createdAt);
        const now = new Date();
        const hoursElapsed = (now - created) / (1000 * 60 * 60);
        const hoursLeft = Math.max(0, 72 - hoursElapsed);

        if (hoursLeft >= 24) {
            return `${Math.floor(hoursLeft / 24)}j`;
        } else if (hoursLeft >= 1) {
            return `${Math.floor(hoursLeft)}h`;
        } else {
            return `<1h`;
        }
    };

    if (!loading && recentListings.length === 0) {
        return null;
    }

    return (
        <div className="mb-6">
            {/* En-tête compact */}
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <Zap size={16} className="text-white" />
                </div>
                <h2 className="text-base md:text-lg font-bold text-secondary-900">
                    Annonces Récentes
                    <span className="text-xs font-normal text-secondary-500 ml-2">Publiées il y a moins de 3 jours</span>
                </h2>
            </div>

            {/* Liste horizontale avec scroll */}
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-3 pb-2" style={{ minWidth: 'max-content' }}>
                    {loading ? (
                        [...Array(8)].map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-32 bg-white rounded-lg overflow-hidden border border-secondary-200 shadow-sm">
                                {/* Image skeleton avec shimmer effect */}
                                <div className="relative h-20 bg-gradient-to-r from-secondary-200 via-secondary-100 to-secondary-200 animate-shimmer" 
                                     style={{ backgroundSize: '200% 100%' }}>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-secondary-300 border-t-primary-500 rounded-full animate-spin" />
                                    </div>
                                </div>
                                {/* Content skeleton */}
                                <div className="p-1.5 space-y-1.5">
                                    <div className="h-2.5 bg-gradient-to-r from-secondary-200 via-secondary-100 to-secondary-200 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                                    <div className="h-3 bg-gradient-to-r from-primary-200 via-primary-100 to-primary-200 rounded w-2/3 animate-pulse" style={{ animationDelay: `${i * 100 + 50}ms` }} />
                                </div>
                            </div>
                        ))
                    ) : (
                        recentListings.map((listing, index) => {
                            const timeLeft = getHoursRemaining(listing.createdAt);
                            const isPro = listing.user?.isPro || listing.user?.accountType === 'PRO';

                            return (
                                <motion.div
                                    key={listing.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.03 }}
                                    onClick={() => navigate(`/listing/${listing.id}`)}
                                    onMouseEnter={() => handlePrefetch(listing.id)}
                                    className="flex-shrink-0 w-32 bg-white rounded-lg overflow-hidden border border-secondary-100 hover:border-blue-400 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                                >
                                    {/* Image compacte */}
                                    <div className="relative h-20 overflow-hidden bg-secondary-100">
                                        <img
                                            src={getImageUrl(listing.mainImage) || IMAGE_PLACEHOLDER}
                                            alt={listing.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />

                                        {/* Badge temps restant */}
                                        <div className="absolute top-1 left-1">
                                            <span className="px-1 py-0.5 bg-blue-500 text-white text-[8px] font-bold rounded-full flex items-center gap-0.5">
                                                <Clock size={8} />
                                                {timeLeft}
                                            </span>
                                        </div>

                                        {/* Badge PRO si applicable */}
                                        {isPro && (
                                            <div className="absolute top-1 right-1">
                                                <span className="px-1 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[8px] font-bold rounded-full flex items-center gap-0.5">
                                                    <Crown size={8} />
                                                </span>
                                            </div>
                                        )}

                                        {/* Vues (en bas à gauche) */}
                                        {listing.viewsCount > 0 && (
                                            <div className="absolute bottom-1 left-1">
                                                <span className="px-1 py-0.5 bg-black/60 text-white text-[8px] rounded-full flex items-center gap-0.5">
                                                    <Eye size={8} />
                                                    {listing.viewsCount}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contenu compact */}
                                    <div className="p-1.5">
                                        <h3 className="font-medium text-[10px] text-secondary-900 line-clamp-1 mb-0.5">
                                            {listing.title}
                                        </h3>

                                        <p className="text-xs font-bold text-primary-600">
                                            {formatPrice(listing.price)} <span className="text-[8px] font-normal">FCFA</span>
                                        </p>

                                        <p className="text-[9px] text-secondary-500 line-clamp-1">
                                            {listing.city || 'Côte d\'Ivoire'}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
