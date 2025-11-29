import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ListingCard from './ListingCard';

/**
 * Carrousel horizontal d'annonces par catégorie - Style Leboncoin
 * Avec flèches de navigation et lien "Voir plus"
 */
export default function CategoryListingsCarousel({ 
  title, 
  listings = [], 
  category,
  onViewMore 
}) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Navigation avec les flèches
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleViewMore = () => {
    if (onViewMore) {
      onViewMore(category);
    }
  };

  if (!listings || listings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* En-tête avec titre et lien */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <h2 className="text-lg md:text-xl font-bold text-secondary-900">{title}</h2>
        <button
          onClick={handleViewMore}
          className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-xs md:text-sm transition-colors group flex-shrink-0"
        >
          <span className="hidden sm:inline">Voir plus d'annonces</span>
          <span className="sm:hidden">Voir plus</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Carrousel */}
      <div className="relative group/carousel">
        {/* Bouton gauche */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity -translate-x-1/2"
        >
          <ChevronLeft size={24} className="text-secondary-700" />
        </button>

        {/* Bouton droite */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity translate-x-1/2"
        >
          <ChevronRight size={24} className="text-secondary-700" />
        </button>

        {/* Liste scrollable */}
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scroll-smooth scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {listings.map((listing, index) => (
            <div 
              key={listing.id}
              className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <ListingCard listing={listing} index={index} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
