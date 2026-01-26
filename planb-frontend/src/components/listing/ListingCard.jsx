import { Heart, Camera, Star, MapPin, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { formatPrice, formatRelativeDate } from '../../utils/format';
import { isFavorite as checkIsFavorite, toggleFavorite } from '../../utils/favorites';
import { getImageUrl } from '../../utils/images';
import { toast } from 'react-hot-toast';
import AuthPrompt from '../auth/AuthPrompt';
import { COUNTRIES } from '../../constants/categories';
import { listingsAPI } from '../../api/listings';

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

    // Vérifier si l'utilisateur est connecté (vérification synchrone du token)
    const isLoggedIn = !!localStorage.getItem('token');
    if (!isLoggedIn) {
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

  // Note cumulée du vendeur (toutes ses annonces) - pour l'en-tête de la carte
  const sellerRating = listing.user?.averageRating || null;
  const sellerReviewsCount = listing.user?.reviewsCount || null;

  // Obtenir le drapeau du pays
  const getCountryFlag = (countryCode) => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    return country ? country.flag : '';
  };

  // Formater la localisation complète
  const formatLocation = () => {
    const parts = [];

    // Ajouter quartier si disponible
    if (listing.quartier) {
      parts.push(listing.quartier);
    }

    // Ajouter commune si disponible
    if (listing.commune) {
      parts.push(listing.commune);
    }

    // Ajouter ville
    if (listing.city) {
      parts.push(listing.city);
    }

    // Formater avec le drapeau du pays
    const locationString = parts.join(', ');
    const countryFlag = getCountryFlag(listing.country);

    return countryFlag ? `${locationString} ${countryFlag}` : locationString;
  };

  // Format compact de la localisation
  const formatLocationCompact = () => {
    const parts = [];
    if (listing.city) parts.push(listing.city);
    const countryFlag = getCountryFlag(listing.country);
    return countryFlag ? `${parts.join(', ')} ${countryFlag}` : parts.join(', ');
  };

  // Précharger l'annonce au survol (pour une navigation plus rapide)
  const handleMouseEnter = useCallback(() => {
    listingsAPI.prefetchListing(listing.id);
  }, [listing.id]);

  return (
    <motion.div
      initial={false}
      animate={false}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/listing/${listing.id}`)}
      onMouseEnter={handleMouseEnter}
      className="cursor-pointer group h-full"
    >
      <div className="bg-gray-800/80 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-white/10">

        {/* En-tête vendeur (masqué en mode compact) */}
        {!compact && (
          <div className="flex items-center gap-2 p-1.5 md:p-2 border-b border-white/10">
            {/* Avatar vendeur */}
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[10px] md:text-xs font-bold flex-shrink-0">
              {getSellerInitials()}
            </div>

            {/* Nom du vendeur */}
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-white truncate">
                {listing.user?.firstName && listing.user?.lastName
                  ? `${listing.user.firstName} ${listing.user.lastName.charAt(0)}.`
                  : listing.user?.firstName || 'Vendeur'}
              </p>
            </div>

            {/* Note cumulée du vendeur (toutes ses annonces) */}
            {sellerRating && (
              <div className="flex items-center gap-0.5 md:gap-1">
                <Star size={12} className="md:w-[14px] md:h-[14px] text-amber-400 fill-amber-400" />
                <span className="text-xs md:text-sm font-medium text-white">{sellerRating.toFixed(1)}</span>
                {sellerReviewsCount && (
                  <span className="text-[10px] md:text-xs text-white/50">({sellerReviewsCount})</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Image - Plus compacte */}
        <div className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-secondary-100 to-secondary-50">
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

          {/* Badge Visite Virtuelle 360° */}
          {listing.virtualTourType && (
            <div className="absolute top-2 left-2 bg-primary-500 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shadow-lg z-10">
              <Globe size={12} />
              <span className="hidden sm:inline">360°</span>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className={`${compact ? 'p-2' : 'p-2.5'} flex-1 flex flex-col`}>
          {/* Titre */}
          <h3 className={`font-medium text-white line-clamp-2 ${compact ? 'text-xs' : 'text-sm'} leading-snug group-hover:text-primary-400 transition-colors`}>
            {listing.title}
          </h3>

          {/* Prix */}
          <p className={`${compact ? 'text-sm mt-0.5' : 'text-base mt-1'} font-bold text-white`}>
            {formatPrice(listing.price)} FCFA
            {listing.type === 'location' && listing.priceUnit && (
              <span className="text-xs font-normal text-white/50"> /{listing.priceUnit}</span>
            )}
          </p>

          {/* Badge PRO */}
          {listing.user?.isPro && (
            <div className="flex mt-1">
              <span className={`inline-flex items-center ${compact ? 'px-2 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs'} font-medium text-primary-400 bg-primary-500/20 border border-primary-500/30 rounded-full`}>
                Pro
              </span>
            </div>
          )}

          {/* Catégorie et Localisation - Style Leboncoin */}
          <div className={`mt-auto ${compact ? 'pt-2' : 'pt-2'} space-y-0.5`}>
            {compact ? (
              <>
                <p className="text-[11px] text-white/60 capitalize">
                  {listing.subcategory || listing.category}
                </p>
                <p className="text-[11px] text-white/40">
                  {formatLocationCompact()}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1 text-white/60">
                  <MapPin size={12} className="flex-shrink-0" />
                  <p className="text-xs truncate">
                    {formatLocation()}
                  </p>
                </div>
                <p className="text-xs text-white/40 flex items-center gap-1">
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
