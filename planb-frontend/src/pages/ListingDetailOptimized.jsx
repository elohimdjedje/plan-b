import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Share2, MapPin, Clock, Star, MessageCircle, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import PlanBLoader from '../components/animations/PlanBLoader';
import ImageGallery from '../components/listing/ImageGallery';
import ViewCounter from '../components/listing/ViewCounter';
import AuthPrompt from '../components/auth/AuthPrompt';
import { formatPrice, formatRelativeDate } from '../utils/format';
import { openWhatsApp, createListingMessage } from '../utils/whatsapp';
import { isListingOwnerSync, isAuthenticated } from '../utils/auth';
import useAuthStore from '../store/authStore';
import { getListingById } from '../utils/listings';
import { listingsAPI } from '../api/listings';
import { isFavorite as checkIsFavorite, toggleFavorite } from '../utils/favorites';
import { prepareListingImages, getImageUrl } from '../utils/images';
import { trackListingView } from '../utils/viewTracking';

/**
 * Page de détail d'une annonce - VERSION OPTIMISÉE
 * Avec compteur de vues professionnel
 */
export default function ListingDetailOptimized() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  
  // Utiliser le store directement (synchrone, pas d'appel API)
  const currentUser = useAuthStore(state => state.user);

  useEffect(() => {
    loadListing();
    
    // Vérifier si l'annonce est en favoris
    setIsFavorite(checkIsFavorite(id));
  }, [id]);

  // Tracking optimisé des vues
  useEffect(() => {
    if (!listing || !id) return;

    // Démarrer le tracking (minimum 3 secondes sur la page)
    const cleanup = trackListingView(id, () => {
      console.log(`✅ Vue comptée pour l'annonce ${id}`);
      
      // Mettre à jour le compteur local (optionnel)
      setListing(prev => ({
        ...prev,
        views: (prev?.views || 0) + 1
      }));
    });

    // Nettoyer au démontage du composant
    return cleanup;
  }, [id, listing]);

  const loadListing = async () => {
    try {
      setLoading(true);
      
      // Charger depuis l'API
      const response = await listingsAPI.getListing(id);
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

  const handleToggleFavorite = async () => {
    if (!isAuthenticated()) {
      setShowAuthPrompt(true);
      return;
    }

    try {
      const newFavoriteState = await toggleFavorite(id);
      setIsFavorite(newFavoriteState);
      
      toast.success(
        newFavoriteState ? 'Ajouté aux favoris ✨' : 'Retiré des favoris',
        { duration: 2000 }
      );
    } catch (error) {
      toast.error('Erreur lors de la modification des favoris');
    }
  };

  const handleContact = async () => {
    if (!listing.contact || !listing.contact.whatsapp) {
      toast.error('Numéro WhatsApp non disponible');
      return;
    }

    // Ouvrir WhatsApp directement
    const message = createListingMessage(listing);
    openWhatsApp(listing.contact.whatsapp, message);
    
    toast.success('Ouverture de WhatsApp...');
  };

  const handleShare = () => {
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `${listing.title} - ${formatPrice(listing.price)}${listing.type === 'location' && listing.priceUnit ? ' /' + listing.priceUnit : ''}`,
        url: url
      }).catch(err => console.log('Erreur partage:', err));
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Lien copié !');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PlanBLoader />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Annonce introuvable</p>
        <Button onClick={() => navigate('/')}>
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  const isOwner = currentUser && isListingOwnerSync(listing, currentUser);
  const images = prepareListingImages(listing.images);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header avec retour */}
      <motion.div 
        className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Retour</span>
          </Button>

          <div className="flex items-center gap-3">
            {/* Compteur de vues - VERSION OPTIMISÉE */}
            <ViewCounter 
              views={listing.views || 0}
              animated={true}
              className="hidden sm:flex"
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className="relative"
            >
              <Heart 
                size={20}
                className={isFavorite ? 'fill-red-500 text-red-500' : ''}
              />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
            >
              <Share2 size={20} />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galerie d'images */}
            <GlassCard className="p-0 overflow-hidden">
              <ImageGallery images={images} />
            </GlassCard>

            {/* Informations */}
            <GlassCard>
              <div className="space-y-4">
                {/* Titre et prix */}
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {formatPrice(listing.price)}
                      {listing.type === 'location' && listing.priceUnit && (
                        <span className="text-xl"> /{listing.priceUnit}</span>
                      )}
                    </span>
                    {listing.category && (
                      <Badge variant="primary">
                        {listing.category}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Statistiques */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {/* Compteur de vues - Mobile */}
                  <ViewCounter 
                    views={listing.views || 0}
                    animated={true}
                    className="sm:hidden"
                  />
                  
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{formatRelativeDate(listing.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{listing.city}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold mb-3">Description</h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vendeur */}
            <GlassCard>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Vendeur</h3>
                
                <div className="flex items-center gap-3">
                  <Avatar 
                    name={listing.user?.firstName || 'Utilisateur'}
                    size="lg"
                  />
                  <div>
                    <p className="font-medium">{listing.user?.firstName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Membre depuis {new Date(listing.user?.createdAt).getFullYear()}
                    </p>
                  </div>
                </div>

                {!isOwner && (
                  <Button
                    onClick={handleContact}
                    className="w-full"
                    size="lg"
                  >
                    <MessageCircle size={20} />
                    Contacter
                  </Button>
                )}

                {isOwner && (
                  <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <p className="text-sm text-primary-700 dark:text-primary-300">
                      C'est votre annonce
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Auth Prompt */}
      {showAuthPrompt && (
        <AuthPrompt 
          onClose={() => setShowAuthPrompt(false)}
          message="Connectez-vous pour contacter le vendeur"
        />
      )}
    </div>
  );
}
