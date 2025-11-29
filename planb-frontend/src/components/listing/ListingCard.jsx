import { Heart, Camera, Star, MapPin } from 'lucide-react';
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
 * Carte d'annonce style Leboncoin amélioré
 * Avec info vendeur, notation, badges et localisation
 */
export default function ListingCard({ 
  listing, 
  index = 0, 
  initialIsFavorite = false,
  onFavoriteToggle,
  compact = false
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

  // Générer les initiales du vendeur
  const getSellerInitials = () => {
    const firstName = listing.user?.firstName || '';
    const lastName = listing.user?.lastName || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return firstName?.[0]?.toUpperCase() || 'V';
  };

  // Note du vendeur (mock ou réelle)
  const sellerRating = listing.user?.averageRating || (listing.user?.isPro ? 4.8 : null);
  const reviewsCount = listing.user?.reviewsCount || (listing.user?.isPro ? Math.floor(Math.random() * 50) + 10 : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="cursor-pointer group h-full"
    >
      <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-secondary-100">
        
        {/* En-tête vendeur (masqué en mode compact) */}
        {!compact && (
          <div className="flex items-center gap-2 p-2 md:p-3 border-b border-secondary-50">
            {/* Avatar vendeur */}
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[10px] md:text-xs font-bold flex-shrink-0">
              {getSellerInitials()}
            </div>
            
            {/* Nom du vendeur */}
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-secondary-800 truncate">
                {listing.user?.firstName && listing.user?.lastName 
                  ? `${listing.user.firstName} ${listing.user.lastName.charAt(0)}.`
                  : listing.user?.firstName || 'Vendeur'}
              </p>
            </div>
            
            {/* Note */}
            {sellerRating && (
              <div className="flex items-center gap-0.5 md:gap-1">
                <Star size={12} className="md:w-[14px] md:h-[14px] text-amber-400 fill-amber-400" />
                <span className="text-xs md:text-sm font-medium text-secondary-700">{sellerRating.toFixed(1)}</span>
                {reviewsCount && (
                  <span className="text-[10px] md:text-xs text-secondary-400">({reviewsCount})</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-secondary-100 to-secondary-50">
          {listing.mainImage || listing.images?.[0]?.url ? (
            <img
              src={getImageUrl(listing.mainImage || listing.images?.[0]?.url)}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`${listing.mainImage || listing.images?.[0]?.url ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-secondary-300`}
          >
            <div className="text-center">
              <Camera size={32} className="mx-auto mb-1 opacity-50" />
              <p className="text-xs">Pas d'image</p>
            </div>
          </div>

          {/* Bouton Favoris */}
          <button
            onClick={handleFavoriteClick}
            className={`
              absolute top-2 right-2
              w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center
              transition-all duration-200 shadow-md
              ${isFavorite 
                ? 'bg-primary-500 scale-110' 
                : 'bg-white/90 hover:bg-white'
              }
            `}
          >
            <Heart 
              size={16} 
              className={`${isFavorite ? 'fill-white text-white' : 'text-secondary-500'}`}
            />
          </button>
        </div>
        
        {/* Contenu */}
        <div className={`${compact ? 'p-2.5' : 'p-3'} flex-1 flex flex-col`}>
          {/* Titre */}
          <h3 className={`font-medium text-secondary-900 line-clamp-2 ${compact ? 'text-sm' : 'text-sm md:text-base'} leading-snug group-hover:text-primary-600 transition-colors`}>
            {listing.title}
          </h3>
          
          {/* Prix */}
          <p className={`${compact ? 'text-base mt-1' : 'text-base md:text-lg mt-1'} font-bold text-secondary-900`}>
            {formatPrice(listing.price)} FCFA
            {listing.type === 'location' && listing.priceUnit && (
              <span className="text-xs font-normal text-secondary-500"> /{listing.priceUnit}</span>
            )}
          </p>
          
          {/* Badge PRO */}
          {listing.user?.isPro && (
            <div className="flex mt-1">
              <span className={`inline-flex items-center ${compact ? 'px-2 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs'} font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-full`}>
                Pro
              </span>
            </div>
          )}
          
          {/* Catégorie et Localisation - Style Leboncoin */}
          <div className={`mt-auto ${compact ? 'pt-2' : 'pt-2'} space-y-0.5`}>
            {compact ? (
              <>
                <p className="text-[11px] text-secondary-500 capitalize">
                  {listing.subcategory || listing.category}
                </p>
                <p className="text-[11px] text-secondary-400">
                  {listing.city}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1 text-secondary-500">
                  <MapPin size={12} />
                  <p className="text-xs truncate">
                    {listing.commune ? `${listing.commune}, ${listing.city}` : listing.city}
                  </p>
                </div>
                <p className="text-xs text-secondary-400 flex items-center gap-1">
                  <span>•</span>
                  {formatRelativeDate(listing.createdAt)}
                </p>
              </>
            )}
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
