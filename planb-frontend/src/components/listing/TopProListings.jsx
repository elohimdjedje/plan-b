import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Camera, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/format';
import { getImageUrl } from '../../utils/images';
import { listingsAPI } from '../../api/listings';

/**
 * Section Top Annonces - Annonces récentes (moins d'une semaine)
 * Toutes les annonces publiées il y a moins de 7 jours apparaissent ici
 * Après une semaine, elles restent dans "Toutes les annonces" mais disparaissent d'ici
 */
export default function TopProListings({ activeCategory = 'all' }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    loadRecentListings();
  }, [activeCategory]);

  const loadRecentListings = async () => {
    try {
      setLoading(true);
      // ✅ Récupérer les annonces des vendeurs PRO uniquement
      const response = await listingsAPI.getProListings(20);
      const listings = response.data || [];

      // Filtrer par catégorie côté client si nécessaire
      const filtered = activeCategory !== 'all'
        ? listings.filter(l => l.category === activeCategory)
        : listings;

      setRecentListings(filtered);
    } catch (error) {
      console.error('Erreur chargement annonces PRO:', error);
      setRecentListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier les possibilités de scroll
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [recentListings]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Calculer le nombre de jours restants avant disparition
  const getDaysRemaining = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = 7 * 24 * 60 * 60 * 1000 - (now - created);
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  // Ne pas afficher si pas d'annonces récentes
  if (!loading && recentListings.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
            <Sparkles size={18} className="text-white" />
          </div>
          <h2 className="text-base md:text-lg font-bold text-secondary-900">
            Top Annonces
            <span className="text-xs font-normal text-secondary-500 ml-2">Nouvelles cette semaine</span>
          </h2>
        </div>

        {/* Boutons de navigation - Desktop uniquement */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full transition-all ${canScrollLeft
                ? 'bg-white shadow-md hover:shadow-lg text-secondary-700 hover:text-primary-500'
                : 'bg-secondary-100 text-secondary-300 cursor-not-allowed'
              }`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-full transition-all ${canScrollRight
                ? 'bg-white shadow-md hover:shadow-lg text-secondary-700 hover:text-primary-500'
                : 'bg-secondary-100 text-secondary-300 cursor-not-allowed'
              }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Liste défilante */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {loading ? (
          // Skeleton loading avec animation
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-40 md:w-52 bg-white rounded-xl overflow-hidden border border-secondary-200 shadow-sm"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Image skeleton avec spinner */}
              <div className="relative h-28 md:h-36 bg-gradient-to-r from-secondary-200 via-secondary-100 to-secondary-200 animate-shimmer" style={{ backgroundSize: '200% 100%' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-3 border-secondary-300 border-t-amber-500 rounded-full animate-spin" />
                </div>
              </div>
              {/* Content skeleton */}
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gradient-to-r from-secondary-200 via-secondary-100 to-secondary-200 rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                <div className="h-5 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 rounded w-2/3 animate-pulse" style={{ animationDelay: `${i * 100 + 50}ms` }} />
              </div>
            </div>
          ))
        ) : (
          recentListings.map((listing, index) => {
            const daysLeft = getDaysRemaining(listing.createdAt);
            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => navigate(`/listing/${listing.id}`)}
                className="flex-shrink-0 w-40 md:w-52 cursor-pointer group"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="bg-gray-800/80 backdrop-blur-xl rounded-xl overflow-hidden border border-amber-500/30 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 relative">
                  {/* Badge "Nouveau" avec jours restants */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[10px] md:text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                      <Sparkles size={10} />
                      {daysLeft > 1 ? `${daysLeft}j` : daysLeft === 1 ? '1j' : 'Dernier jour'}
                    </span>
                  </div>

                  {/* Badge PRO si vendeur PRO */}
                  {listing.user?.isPro && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-bold rounded-full">
                        PRO
                      </span>
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative h-28 md:h-36 overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800">
                    {listing.mainImage || listing.images?.[0]?.url ? (
                      <img
                        src={getImageUrl(listing.mainImage || listing.images?.[0]?.url)}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <Camera size={32} />
                      </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Contenu */}
                  <div className="p-2.5 md:p-3">
                    <h3 className="font-semibold text-white text-xs md:text-sm line-clamp-2 leading-tight mb-1">
                      {listing.title}
                    </h3>

                    <p className="text-sm md:text-base font-bold text-white">
                      {formatPrice(listing.price)} <span className="text-xs font-normal">FCFA</span>
                      {listing.type === 'location' && listing.priceUnit && (
                        <span className="text-[10px] md:text-xs font-normal text-white/50"> /{listing.priceUnit}</span>
                      )}
                    </p>

                    <p className="text-[10px] md:text-xs text-white/50 mt-1 line-clamp-1">
                      {listing.city}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
