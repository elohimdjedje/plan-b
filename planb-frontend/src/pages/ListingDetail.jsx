import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Share2, MapPin, Clock, Eye, Star, MessageCircle, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import PlanBLoader from '../components/animations/PlanBLoader';
import ImageGallery from '../components/listing/ImageGallery';
import AuthPrompt from '../components/auth/AuthPrompt';
import ContactOptions from '../components/listing/ContactOptions';
import ReviewSection from '../components/listing/ReviewSection';
import { formatPrice, formatRelativeDate } from '../utils/format';
import { getCurrentUser, isListingOwnerSync, isAuthenticated } from '../utils/auth';
import { incrementListingViews, getListingById } from '../utils/listings';
import { listingsAPI } from '../api/listings';
import { isFavorite as checkIsFavorite, toggleFavorite } from '../utils/favorites';
import { prepareListingImages, getImageUrl } from '../utils/images';

/**
 * Page de détail d'une annonce
 */
export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadListing();
    loadCurrentUser();
    
    // Incrémenter les vues de l'annonce
    if (id) {
      incrementListingViews(id);
    }
    
    // Vérifier si l'annonce est en favoris
    setIsFavorite(checkIsFavorite(id));
  }, [id]);
  
  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
      setCurrentUser(null);
    }
  };

  const loadListing = async () => {
    try {
      setLoading(true);
      
      // Charger depuis l'API
      const response = await listingsAPI.getListing(id);
      console.log('API Response:', response);
      
      // La réponse peut être response.data ou directement response
      const listingData = response.data || response;
      
      if (listingData) {
        setListing(listingData);
      } else {
        toast.error('Annonce introuvable');
        setListing(null);
      }
    } catch (error) {
      console.error('Erreur chargement annonce:', error);
      toast.error('Annonce introuvable');
      setListing(null);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `${listing.title} - ${formatPrice(listing.price)} FCFA${listing.type === 'location' && listing.priceUnit ? ' /' + listing.priceUnit : ''}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié !');
    }
  };

  const handleContact = () => {
    // Ouvrir le modal de contact multi-canal
    setShowContactModal(true);
  };

  const handleFavoriteClick = () => {
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated()) {
      setShowAuthPrompt(true);
      return;
    }

    const newFavoriteState = toggleFavorite(id);
    setIsFavorite(newFavoriteState);
    
    toast.success(
      newFavoriteState 
        ? 'Ajouté aux favoris' 
        : 'Retiré des favoris'
    );
  };

  if (loading) {
    return <PlanBLoader />;
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-secondary-600">Annonce introuvable</p>
      </div>
    );
  }

  // Vérifier si l'utilisateur connecté est le propriétaire de l'annonce
  const isOwner = isListingOwnerSync(listing, currentUser);
  
  // Construire le nom de l'utilisateur
  const userName = listing.user?.name || 
    `${listing.user?.firstName || ''} ${listing.user?.lastName || ''}`.trim() || 
    'Utilisateur';
  
  console.log('ListingDetail - Debug:', {
    currentUserId: currentUser?.id,
    listingUserId: listing.userId,
    listingUserObjId: listing.user?.id,
    userName,
    isOwner
  });

  // Préparer les images pour la galerie avec URLs absolues
  const images = prepareListingImages(listing);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
      {/* Header fixe */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-secondary-200"
      >
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-secondary-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFavoriteClick}
              className="p-2 hover:bg-secondary-100 rounded-xl transition-colors"
            >
              <Heart
                size={24}
                className={isFavorite ? 'fill-red-500 text-red-500' : 'text-secondary-600'}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-secondary-100 rounded-xl transition-colors"
            >
              <Share2 size={24} className="text-secondary-600" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Galerie d'images avec zoom */}
      <div className="pt-16">
        <ImageGallery images={images} listing={listing} />
      </div>

      {/* Contenu */}
      <div className="max-w-md mx-auto px-4 -mt-8 relative pb-24">
        {/* Informations principales */}
        <GlassCard className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            {listing.user?.accountType === 'PRO' && (
              <Badge variant="pro" size="sm">
                <Star size={12} className="fill-yellow-900" />
                PRO Vérifié
              </Badge>
            )}
            {listing.isFeatured && (
              <Badge variant="featured" size="sm">
                ⭐ VEDETTE
              </Badge>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-secondary-900 mb-3">
            {listing.title}
          </h1>
          
          <div className="text-3xl font-bold text-primary-500 mb-3">
            {formatPrice(listing.price)} FCFA
            {listing.type === 'location' && listing.priceUnit && (
              <span className="text-xl"> /{listing.priceUnit}</span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-secondary-600">
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>
                {listing.quartier && listing.commune 
                  ? `${listing.quartier}, ${listing.commune}, ${listing.city}, ${listing.country}` 
                  : `${listing.city}, ${listing.country}`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{formatRelativeDate(listing.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={16} />
              <span>{listing.viewsCount || 0} vues</span>
            </div>
          </div>
        </GlassCard>

        {/* Description */}
        <GlassCard className="mb-4">
          <h3 className="font-semibold text-lg mb-3">Description</h3>
          <p className="text-secondary-700 whitespace-pre-line leading-relaxed">
            {listing.description}
          </p>
        </GlassCard>

        {/* Caractéristiques */}
        {listing.specifications && Object.keys(listing.specifications).length > 0 && (
          <GlassCard className="mb-4">
            <h3 className="font-semibold text-lg mb-3">Caractéristiques</h3>
            <div className="grid grid-cols-2 gap-3">
              {listing.specifications.rooms && (
                <div className="bg-primary-50 p-3 rounded-xl">
                  <div className="text-2xl mb-1">🛏️</div>
                  <div className="text-sm font-semibold">{listing.specifications.rooms} Chambres</div>
                </div>
              )}
              {listing.specifications.bathrooms && (
                <div className="bg-primary-50 p-3 rounded-xl">
                  <div className="text-2xl mb-1">🚿</div>
                  <div className="text-sm font-semibold">{listing.specifications.bathrooms} Salles de bain</div>
                </div>
              )}
              {listing.specifications.surface && (
                <div className="bg-primary-50 p-3 rounded-xl">
                  <div className="text-2xl mb-1">📐</div>
                  <div className="text-sm font-semibold">{listing.specifications.surface} m²</div>
                </div>
              )}
              {listing.specifications.condition && (
                <div className="bg-primary-50 p-3 rounded-xl">
                  <div className="text-2xl mb-1">🏗️</div>
                  <div className="text-sm font-semibold">{listing.specifications.condition}</div>
                </div>
              )}
              {listing.specifications.parking && (
                <div className="bg-primary-50 p-3 rounded-xl">
                  <div className="text-2xl mb-1">🅿️</div>
                  <div className="text-sm font-semibold">{listing.specifications.parking} Parkings</div>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* Vendeur - Cliquable uniquement si ce n'est pas le propriétaire */}
        <GlassCard className="mb-4">
          <h3 className="font-semibold text-lg mb-3">Vendeur</h3>
          {isOwner ? (
            <div className="flex items-center gap-3">
              <Avatar name={userName} size="lg" />
              <div className="flex-1">
                <div className="font-semibold text-secondary-900">{userName}</div>
                <div className="text-sm text-secondary-600">
                  {listing.user?.city || 'Localisation non précisée'}
                </div>
                <div className="text-xs text-primary-600 font-medium mt-1">
                  C'est votre annonce
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate(`/seller/${listing.user?.id}`)}
              className="flex items-center gap-3 w-full hover:bg-secondary-50 rounded-xl p-2 -m-2 transition-colors"
            >
              <Avatar name={userName} size="lg" />
              <div className="flex-1 text-left">
                <div className="font-semibold text-secondary-900">{userName}</div>
                <div className="text-sm text-secondary-600">
                  {listing.user?.city || 'Localisation non précisée'}
                </div>
                <div className="text-xs text-primary-600 font-medium mt-1">
                  Voir le profil →
                </div>
              </div>
            </button>
          )}
        </GlassCard>

        {/* Section Avis */}
        {listing.user?.id && (
          <ReviewSection 
            listing={listing}
            currentUser={currentUser}
            sellerId={listing.user.id}
          />
        )}
      </div>

      {/* Bouton contact fixe - Caché si c'est le propriétaire */}
      {!isOwner && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
        >
          <div className="bg-white/70 backdrop-blur-xl border-t border-white/20 p-4 shadow-lg">
            <div className="max-w-md mx-auto">
              <button
                onClick={handleContact}
                className="w-full bg-gradient-to-r from-primary-500 to-orange-500 hover:from-primary-600 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-95"
              >
                <MessageCircle size={22} />
                <span className="text-lg">Contacter le vendeur</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modale d'invitation à se connecter */}
      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        message="Pour contacter ce vendeur, vous devez créer un compte gratuitement ou vous connecter."
      />

      {/* Modal de contact multi-canal */}
      <AnimatePresence>
        {showContactModal && (
          <ContactOptions
            seller={listing.user}
            listing={listing}
            onClose={() => setShowContactModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
