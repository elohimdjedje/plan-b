import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Crown, Camera, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/format';
import { getImageUrl } from '../../utils/images';
import { listingsAPI } from '../../api/listings';

/**
 * Section Top Annonces PRO - Défilement horizontal
 * Filtrées par catégorie active
 */
export default function TopProListings({ activeCategory = 'all' }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [proListings, setProListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    loadProListings();
  }, [activeCategory]);

  const loadProListings = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getProListings();
      let listings = response.data || [];
      
      // Filtrer par catégorie si une catégorie est sélectionnée
      if (activeCategory && activeCategory !== 'all') {
        listings = listings.filter(listing => listing.category === activeCategory);
      }
      
      setProListings(listings);
    } catch (error) {
      console.error('Erreur chargement annonces PRO:', error);
      setProListings([]);
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
  }, [proListings]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Ne pas afficher si pas d'annonces PRO
  if (!loading && proListings.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
            <Crown size={18} className="text-white" />
          </div>
          <h2 className="text-base md:text-lg font-bold text-secondary-900">
            Top Annonces 
          </h2>
        </div>
        
        {/* Boutons de navigation - Desktop uniquement */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full transition-all ${
              canScrollLeft 
                ? 'bg-white shadow-md hover:shadow-lg text-secondary-700 hover:text-primary-500' 
                : 'bg-secondary-100 text-secondary-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-full transition-all ${
              canScrollRight 
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
          // Skeleton loading
          [...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="flex-shrink-0 w-40 md:w-52 bg-white/50 rounded-xl animate-pulse"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="h-28 md:h-36 bg-secondary-200 rounded-t-xl" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-secondary-200 rounded w-3/4" />
                <div className="h-5 bg-secondary-200 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : (
          proListings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => navigate(`/listing/${listing.id}`)}
              className="flex-shrink-0 w-40 md:w-52 cursor-pointer group"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="bg-white/70 backdrop-blur-xl rounded-xl overflow-hidden border border-amber-200/50 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300">
                {/* Badge PRO flottant */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] md:text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                    <Crown size={10} />
                    PRO
                  </span>
                </div>

                {/* Image */}
                <div className="relative h-28 md:h-36 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                  {listing.mainImage || listing.images?.[0]?.url ? (
                    <img
                      src={getImageUrl(listing.mainImage || listing.images?.[0]?.url)}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary-300">
                      <Camera size={32} />
                    </div>
                  )}
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Contenu */}
                <div className="p-2.5 md:p-3">
                  <h3 className="font-semibold text-secondary-900 text-xs md:text-sm line-clamp-2 leading-tight mb-1">
                    {listing.title}
                  </h3>
                  
                  <p className="text-sm md:text-base font-bold text-secondary-900">
                    {formatPrice(listing.price)} <span className="text-xs font-normal">FCFA</span>
                    {listing.type === 'location' && listing.priceUnit && (
                      <span className="text-[10px] md:text-xs font-normal text-secondary-500"> /{listing.priceUnit}</span>
                    )}
                  </p>
                  
                  <p className="text-[10px] md:text-xs text-secondary-500 mt-1 line-clamp-1">
                    {listing.city}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
