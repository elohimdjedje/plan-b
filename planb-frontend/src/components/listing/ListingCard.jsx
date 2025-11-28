import { Heart, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { formatPrice, formatRelativeDate } from '../../utils/format';
import { getCurrentUser } from '../../utils/auth';
import { isFavorite as checkIsFavorite, toggleFavorite } from '../../utils/favorites';
import { getImageUrl } from '../../utils/images';
import { toast } from 'react-hot-toast';
import AuthPrompt from '../auth/AuthPrompt';

/**
 * Carte d'annonce style Le Bon Coin (Version Plan B)
 */
export default function ListingCard({ 
  listing, 
  index = 0, 
  initialIsFavorite = false,
  onFavoriteToggle 
}) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Vérifier l'état favori au montage et lors des changements
  useEffect(() => {
    setIsFavorite(checkIsFavorite(listing.id));
  }, [listing.id]);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    
    // Vérifier si l'utilisateur est connecté
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setShowAuthPrompt(true);
      return;
    }
    
    // Basculer l'état favori
    const newFavoriteState = toggleFavorite(listing.id);
    setIsFavorite(newFavoriteState);
    
    // Toast de confirmation
    if (newFavoriteState) {
      toast.success('❤️ Ajouté aux favoris');
    } else {
      toast.success('💔 Retiré des favoris');
    }
    
    // Notifier le parent si un callback est fourni
    if (onFavoriteToggle) {
      onFavoriteToggle(listing.id, newFavoriteState);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="cursor-pointer group h-full"
    >
      {/* Carte style Le Bon Coin */}
      <div className="bg-white/50 backdrop-blur-xl rounded-lg md:rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full border border-white/30 min-h-[280px] md:min-h-[480px]">
        {/* Image */}
        <div className="relative h-32 md:h-56 lg:h-64 overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-100 to-secondary-100">
          {listing.mainImage || listing.images?.[0]?.url ? (
            <img
              src={getImageUrl(listing.mainImage || listing.images?.[0]?.url)}
              alt={listing.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`${listing.mainImage || listing.images?.[0]?.url ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-secondary-400`}
            style={{ display: listing.mainImage || listing.images?.[0]?.url ? 'none' : 'flex' }}
          >
            <div className="text-center">
              <Camera size={48} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Pas d'image</p>
            </div>
          </div>

          {/* Bouton Favoris - En haut à droite */}
          <button
            onClick={handleFavoriteClick}
            className={`
              absolute top-1.5 right-1.5 md:top-3 md:right-3
              w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center
              transition-all duration-200
              ${isFavorite 
                ? 'bg-primary-500 scale-110' 
                : 'bg-white hover:bg-secondary-50'
              }
              shadow-md
            `}
          >
            <Heart 
              size={14} 
              className={`md:w-5 md:h-5 ${isFavorite ? 'fill-white text-white' : 'text-secondary-600'}`}
            />
          </button>
        </div>
        
        {/* Informations */}
        <div className="p-2 md:p-4 lg:p-5 space-y-1 md:space-y-2 flex-1 flex flex-col">
          {/* Titre */}
          <h3 className="font-semibold text-secondary-900 line-clamp-2 text-xs md:text-base lg:text-lg leading-tight">
            {listing.title}
          </h3>
          
          {/* Surface (si disponible) - Caché sur mobile */}
          {listing.specifications?.surface && (
            <p className="hidden md:block text-secondary-700 text-sm">
              {listing.specifications.surface} m²
            </p>
          )}
          
          {/* Prix */}
          <p className="text-sm md:text-lg lg:text-xl font-bold text-secondary-900">
            {formatPrice(listing.price)} FCFA
            {listing.type === 'location' && listing.priceUnit && (
              <span className="text-xs md:text-sm font-normal"> /{listing.priceUnit}</span>
            )}
          </p>
          
          {/* Badge PRO - Caché sur mobile */}
          {listing.user?.accountType === 'PRO' && (
            <div className="hidden md:inline-flex">
              <span className="px-2 py-0.5 md:px-3 md:py-1 text-xs md:text-sm font-semibold text-primary-700 border border-primary-300 rounded-full">
                Pro
              </span>
            </div>
          )}
          
          {/* Localisation */}
          <div className="mt-auto pt-1 md:pt-2">
            <p className="hidden md:block text-sm font-medium text-secondary-900">
              {listing.type === 'location' ? 'Locations' : 'Ventes'}
            </p>
            <p className="text-[10px] md:text-xs text-secondary-600 line-clamp-1">
              {listing.quartier && listing.commune 
                ? `${listing.quartier}, ${listing.commune}, ${listing.city}` 
                : listing.city}
            </p>
            <p className="text-[10px] md:text-xs text-secondary-500">
              {formatRelativeDate(listing.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Modale d'invitation à se connecter */}
      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        message="Pour ajouter des annonces à vos favoris, créez un compte gratuitement."
      />
    </motion.div>
  );
}
