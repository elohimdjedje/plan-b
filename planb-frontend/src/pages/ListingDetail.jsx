import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Heart, Share2, MapPin, Clock, Eye, Star,
  MessageCircle, Phone, ChevronRight, Camera, Home,
  Shield, CheckCircle2, Mail, MessageSquare, Globe, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/common/Button';
import PlanBLoader from '../components/animations/PlanBLoader';
import AuthPrompt from '../components/auth/AuthPrompt';
import ContactOptions from '../components/listing/ContactOptions';
import ReviewSection from '../components/listing/ReviewSection';
import KeyInformation from '../components/listing/KeyInformation';
import VirtualTour from '../components/listing/VirtualTour';
import ReportButton from '../components/report/ReportButton';
import { virtualTourAPI } from '../api/virtualTour';
import { formatPrice, formatRelativeDate } from '../utils/format';
import { isListingOwnerSync, isAuthenticated } from '../utils/auth';
import { useAuthStore } from '../store/authStore';
import { incrementListingViews } from '../utils/listings';
import { listingsAPI } from '../api/listings';
import { isFavorite as checkIsFavorite, toggleFavorite } from '../utils/favorites';
import { prepareListingImages, getImageUrl } from '../utils/images';

/**
 * Page de détail d'une annonce
 */
export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: storeUser } = useAuthStore();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [virtualTourData, setVirtualTourData] = useState(null);
  const [currentUser, setCurrentUser] = useState(storeUser);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fonction pour incrémenter le compteur de contacts
  const incrementContactCount = async () => {
    if (id) {
      try {
        await listingsAPI.incrementContacts(id);
        console.log('Contact enregistré pour l\'annonce', id);
      } catch (error) {
        console.error('Erreur incrémentation contacts:', error);
      }
    }
  };

  useEffect(() => {
    loadListing();

    // Utiliser l'utilisateur du store directement (plus rapide, pas d'appel API)
    if (storeUser) {
      setCurrentUser(storeUser);
    }

    // Incrémenter les vues de l'annonce (en arrière-plan, non-bloquant)
    if (id) {
      setTimeout(() => incrementListingViews(id), 500);
    }

    // Vérifier si l'annonce est en favoris
    setIsFavorite(checkIsFavorite(id));

    // Charger la visite virtuelle si disponible
    if (id) {
      virtualTourAPI.get(id)
        .then(data => {
          if (data && data.url) {
            setVirtualTourData(data);
          }
        })
        .catch(() => {
          // Pas de visite virtuelle ou erreur - c'est normal
        });
    }
  }, [id, storeUser]);

  const loadListing = async () => {
    try {
      // Ne pas afficher loading si on a déjà des données
      if (!listing) {
        setLoading(true);
      }

      // Charger depuis l'API (avec cache automatique)
      const response = await listingsAPI.getListing(id);

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
  const userName = listing.user?.firstName && listing.user?.lastName
    ? `${listing.user.firstName} ${listing.user.lastName}`
    : listing.user?.firstName || 'Vendeur';

  // Initiales pour l'avatar
  const userInitials = listing.user?.firstName && listing.user?.lastName
    ? `${listing.user.firstName[0]}${listing.user.lastName[0]}`.toUpperCase()
    : listing.user?.firstName?.[0]?.toUpperCase() || 'V';

  // Préparer les images pour la galerie avec URLs absolues
  const images = prepareListingImages(listing);

  return (
    <div className="min-h-screen bg-white">
      {/* Header fixe */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-secondary-200"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-secondary-100 rounded-xl transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            <span className="hidden md:inline text-sm font-medium">Retour</span>
          </button>
          <div className="flex items-center gap-2">
            {!isOwner && (
              <ReportButton listingId={parseInt(id)} />
            )}
            <button
              onClick={handleShare}
              className="p-2 hover:bg-secondary-100 rounded-xl transition-colors"
            >
              <Share2 size={20} className="text-secondary-600" />
            </button>
            <button
              onClick={handleFavoriteClick}
              className="p-2 hover:bg-secondary-100 rounded-xl transition-colors"
            >
              <Heart
                size={20}
                className={isFavorite ? 'fill-red-500 text-red-500' : 'text-secondary-600'}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="pt-16 pb-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

            {/* Colonne gauche - Images et infos */}
            <div className="md:col-span-2 space-y-4">

              {/* Galerie d'images style Leboncoin */}
              <div className="bg-white rounded-xl overflow-hidden border border-secondary-100">
                {/* Image principale */}
                <div className="relative aspect-[4/3] md:aspect-[16/10] bg-secondary-100">
                  {images.length > 0 ? (
                    <img
                      src={getImageUrl(images[selectedImageIndex]?.url || images[selectedImageIndex])}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary-400">
                      <Camera size={64} />
                    </div>
                  )}

                  {/* Badge nombre de photos */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                      <Camera size={16} />
                      Voir les {images.length} photos
                    </div>
                  )}

                  {/* Bouton favori sur l'image */}
                  <button
                    onClick={handleFavoriteClick}
                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <Heart
                      size={20}
                      className={isFavorite ? 'fill-red-500 text-red-500' : 'text-secondary-500'}
                    />
                  </button>
                </div>

                {/* Miniatures */}
                {images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
                    {images.slice(0, 5).map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index
                            ? 'border-primary-500'
                            : 'border-transparent hover:border-secondary-300'
                          }`}
                      >
                        <img
                          src={getImageUrl(img?.url || img)}
                          alt={`${listing.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                    {images.length > 5 && (
                      <div className="flex-shrink-0 w-20 h-16 rounded-lg bg-secondary-100 flex items-center justify-center text-sm font-medium text-secondary-600">
                        +{images.length - 5}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Prix et infos principales */}
              <div className="bg-white rounded-xl p-5 border border-secondary-100">
                {/* Prix */}
                <div className="text-3xl md:text-4xl font-bold text-secondary-900 mb-2">
                  {formatPrice(listing.price)} FCFA
                  {listing.type === 'location' && listing.priceUnit && (
                    <span className="text-lg font-normal text-secondary-500"> /{listing.priceUnit}</span>
                  )}
                </div>

                {/* Spécifications rapides */}
                {listing.specifications && (
                  <div className="flex flex-wrap gap-2 text-sm text-secondary-700 mb-3">
                    {listing.specifications.rooms && (
                      <span>{listing.specifications.rooms} Pièces</span>
                    )}
                    {listing.specifications.rooms && listing.specifications.surface && (
                      <span className="text-secondary-300">•</span>
                    )}
                    {listing.specifications.surface && (
                      <span>{listing.specifications.surface} m²</span>
                    )}
                    {(listing.specifications.rooms || listing.specifications.surface) && listing.city && (
                      <span className="text-secondary-300">•</span>
                    )}
                    {listing.city && (
                      <span>{listing.commune ? `${listing.commune}, ` : ''}{listing.city}</span>
                    )}
                  </div>
                )}

                {/* Titre */}
                <h1 className="text-xl md:text-2xl font-semibold text-secondary-800 mb-3">
                  {listing.title}
                </h1>

                {/* Date et vues */}
                <div className="flex items-center gap-4 text-sm text-secondary-500">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{formatRelativeDate(listing.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    <span>{listing.viewsCount || 0} vues</span>
                  </div>
                </div>
              </div>

              {/* Informations clés - Style Leboncoin */}
              <KeyInformation listing={listing} />

              {/* Bouton Réserver - Redirige vers la page de réservation */}
              {!isOwner && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-5 border border-secondary-100"
                >
                  <button
                    onClick={() => navigate(`/booking/${listing.id}`)}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-orange-500/25"
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Réserver maintenant</span>
                  </button>
                  <p className="text-center text-sm text-secondary-500 mt-3">
                    Réservez directement et payez en toute sécurité
                  </p>
                </motion.div>
              )}

              {/* Description */}
              <div className="bg-white rounded-xl p-5 border border-secondary-100">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">Description</h2>
                <p className="text-secondary-700 whitespace-pre-line leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Bouton Visite Virtuelle */}
              {virtualTourData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-primary-500 to-orange-500 rounded-xl p-1"
                >
                  <Button
                    variant="primary"
                    onClick={() => setShowVirtualTour(true)}
                    className="w-full flex items-center justify-center gap-2 py-4 text-lg font-semibold bg-white text-primary-600 hover:bg-primary-50"
                  >
                    <Globe size={24} />
                    Visite Virtuelle 360°
                  </Button>
                </motion.div>
              )}

              {/* Localisation */}
              <div className="bg-white rounded-xl p-5 border border-secondary-100">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">Localisation</h2>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <div className="font-medium text-secondary-900">
                      {listing.quartier && `${listing.quartier}, `}
                      {listing.commune && `${listing.commune}, `}
                      {listing.city}
                    </div>
                    <div className="text-sm text-secondary-500">{listing.country || 'Côte d\'Ivoire'}</div>
                  </div>
                </div>
              </div>

              {/* Section Avis - Desktop */}
              <div className="hidden md:block">
                {listing.user?.id && (
                  <ReviewSection
                    listing={listing}
                    currentUser={currentUser}
                    sellerId={listing.user.id}
                  />
                )}
              </div>
            </div>

            {/* Colonne droite - Vendeur (sticky sur desktop) */}
            <div className="md:col-span-1">
              <div className="md:sticky md:top-20 space-y-4">

                {/* Carte vendeur style Leboncoin */}
                <div className="bg-white rounded-xl p-5 border border-secondary-100">
                  {/* En-tête vendeur */}
                  <button
                    onClick={() => !isOwner && navigate(`/seller/${listing.user?.id}`)}
                    className={`flex items-center gap-4 w-full ${!isOwner ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity`}
                  >
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {userInitials}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-secondary-900 text-lg flex items-center gap-2">
                        {userName}
                        {!isOwner && <ChevronRight size={18} className="text-secondary-400" />}
                      </div>

                      {/* Badge PRO */}
                      {listing.user?.isPro && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded mt-1">
                          <Star size={10} className="fill-current" />
                          Pro
                        </span>
                      )}
                    </div>
                  </button>

                  {isOwner && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                        <CheckCircle2 size={16} />
                        C'est votre annonce
                      </div>
                    </div>
                  )}

                  {/* Boutons de contact directs - Seulement ceux saisis lors de la publication */}
                  {!isOwner && (listing.contactWhatsapp || listing.contactPhone || listing.contactEmail) && (
                    <div className="mt-5">
                      <p className="text-sm text-secondary-500 mb-3">Contacter directement :</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {/* WhatsApp - seulement si saisi */}
                        {listing.contactWhatsapp && (
                          <button
                            onClick={() => {
                              incrementContactCount();
                              const message = `Bonjour, je suis intéressé(e) par votre annonce "${listing.title}" sur Plan B.`;
                              window.open(`https://wa.me/${listing.contactWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            className="flex flex-col items-center gap-1.5 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
                          >
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                            </div>
                            <span className="text-xs font-medium text-green-700">WhatsApp</span>
                          </button>
                        )}

                        {/* Téléphone - seulement si saisi */}
                        {listing.contactPhone && (
                          <button
                            onClick={() => {
                              incrementContactCount();
                              window.location.href = `tel:${listing.contactPhone}`;
                            }}
                            className="flex flex-col items-center gap-1.5 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                          >
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Phone size={20} className="text-white" />
                            </div>
                            <span className="text-xs font-medium text-blue-700">Appeler</span>
                          </button>
                        )}

                        {/* SMS - seulement si téléphone saisi */}
                        {listing.contactPhone && (
                          <button
                            onClick={() => {
                              incrementContactCount();
                              const message = `Bonjour, je suis intéressé(e) par "${listing.title}" sur Plan B.`;
                              window.location.href = `sms:${listing.contactPhone}?body=${encodeURIComponent(message)}`;
                            }}
                            className="flex flex-col items-center gap-1.5 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
                          >
                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <MessageSquare size={20} className="text-white" />
                            </div>
                            <span className="text-xs font-medium text-purple-700">SMS</span>
                          </button>
                        )}

                        {/* Email - seulement si saisi */}
                        {listing.contactEmail && (
                          <button
                            onClick={() => {
                              incrementContactCount();
                              const subject = `À propos de: ${listing.title}`;
                              const body = `Bonjour,\n\nJe suis intéressé(e) par votre annonce "${listing.title}" sur Plan B.\n\nCordialement`;
                              window.location.href = `mailto:${listing.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                            }}
                            className="flex flex-col items-center gap-1.5 p-3 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors group"
                          >
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Mail size={20} className="text-white" />
                            </div>
                            <span className="text-xs font-medium text-orange-700">Email</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bouton Réserver - Visible uniquement si connecté et pas propriétaire */}
                  {isAuthenticated() && !isOwner && (
                    <div className="mt-5">
                      <Button
                        onClick={() => navigate(`/booking/${listing.id}`)}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-5 h-5" />
                        Réserver maintenant
                      </Button>
                      <p className="text-xs text-secondary-500 text-center mt-2">
                        Réservez directement et payez en toute sécurité
                      </p>
                    </div>
                  )}
                </div>

                {/* Avantages Plan B */}
                <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-xl p-5 border border-primary-100">
                  <h3 className="font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                    <Shield size={18} className="text-primary-600" />
                    Achetez en toute sécurité
                  </h3>
                  <ul className="space-y-2 text-sm text-secondary-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                      <span>Vendeurs vérifiés</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                      <span>Échangez via la messagerie</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                      <span>Signalez les annonces suspectes</span>
                    </li>
                  </ul>
                </div>

                {/* Section Avis - Mobile */}
                <div className="md:hidden">
                  {listing.user?.id && (
                    <ReviewSection
                      listing={listing}
                      currentUser={currentUser}
                      sellerId={listing.user.id}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {/* Modal Visite Virtuelle */}
      {virtualTourData && (
        <VirtualTour
          isOpen={showVirtualTour}
          onClose={() => setShowVirtualTour(false)}
          imageUrl={virtualTourData.url}
          thumbnailUrl={virtualTourData.thumbnail}
        />
      )}
    </div>
  );
}
