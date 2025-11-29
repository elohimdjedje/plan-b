import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Star, MessageCircle, Phone, MessageSquare } from 'lucide-react';
import MobileContainer from '../components/layout/MobileContainer';
import GlassCard from '../components/common/GlassCard';
import Avatar from '../components/common/Avatar';
import ListingCard from '../components/listing/ListingCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import PlanBLoader from '../components/animations/PlanBLoader';
import { formatRelativeDate } from '../utils/format';
import { openWhatsApp } from '../utils/whatsapp';
import { getCurrentUser } from '../utils/auth';
import { usersAPI } from '../api/users';
import { getImageUrl } from '../utils/images';
import { toast } from 'react-hot-toast';

/**
 * Page de profil du vendeur avec ses annonces par catégorie
 */
export default function SellerProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadSellerProfile = async () => {
      try {
        setLoading(true);

        // Vérifier si l'utilisateur essaie d'accéder à son propre profil
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id == userId) {
          toast.error('Vous ne pouvez pas voir votre propre profil vendeur');
          navigate('/profile');
          return;
        }

        // Charger les vraies données depuis l'API
        const data = await usersAPI.getPublicProfile(userId);
        
        // Chercher les contacts dans les annonces si pas dans le profil
        const listings = data.listings || [];
        let fallbackPhone = null;
        let fallbackWhatsapp = null;
        
        for (const listing of listings) {
          if (!fallbackPhone && listing.contactPhone) fallbackPhone = listing.contactPhone;
          if (!fallbackWhatsapp && listing.contactWhatsapp) fallbackWhatsapp = listing.contactWhatsapp;
          if (fallbackPhone && fallbackWhatsapp) break;
        }

        setSeller({
          id: data.user.id,
          name: data.user.fullName,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phone: data.user.phone || fallbackPhone,
          whatsappPhone: data.user.whatsappPhone || fallbackWhatsapp,
          accountType: data.user.accountType,
          isPro: data.user.isPro,
          memberSince: data.user.memberSince,
          location: `${data.user.city || ''}${data.user.city && data.user.country ? ', ' : ''}${data.user.country || ''}`.trim() || 'Non renseigné',
          bio: data.user.bio || null,
          profilePicture: data.user.profilePicture,
          activeListings: data.stats.activeListings,
          totalViews: data.stats.totalViews,
          totalContacts: data.stats.totalContacts,
          averageRating: data.user.averageRating || 0,
          reviewsCount: data.user.reviewsCount || 0
        });

        setListings(listings);
        
      } catch (error) {
        console.error('Erreur chargement profil vendeur:', error);
        toast.error('Impossible de charger le profil du vendeur');
        setSeller(null);
      } finally {
        setLoading(false);
      }
    };

    loadSellerProfile();
  }, [userId, navigate]);

  if (loading) {
    return <PlanBLoader />;
  }

  if (!seller) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-secondary-600">Profil introuvable</p>
        </div>
      </MobileContainer>
    );
  }

  // Grouper les annonces par catégorie
  const categorizedListings = {
    all: listings,
    immobilier: listings.filter(l => l.category === 'immobilier'),
    vehicule: listings.filter(l => l.category === 'vehicule'),
    vacance: listings.filter(l => l.category === 'vacance')
  };

  const categories = [
    { id: 'all', label: 'Tout', count: categorizedListings.all.length },
    { id: 'immobilier', label: 'Immobilier', count: categorizedListings.immobilier.length },
    { id: 'vehicule', label: 'Véhicule', count: categorizedListings.vehicule.length },
    { id: 'vacance', label: 'Vacance', count: categorizedListings.vacance.length }
  ];

  const filteredListings = categorizedListings[selectedCategory] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
      {/* Header avec retour */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-secondary-200">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-secondary-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold flex-1">Profil du vendeur</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-20 pb-24">
        {/* Carte de profil */}
        <GlassCard className="mb-4">
          <div className="flex items-start gap-4 mb-4">
            <Avatar name={seller.name} size="xl" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-secondary-900">{seller.name}</h2>
                {seller.isPro && (
                  <Badge variant="pro" size="sm">
                    <Star size={12} className="fill-yellow-500" />
                    PRO
                  </Badge>
                )}
              </div>
              
              {/* Score étoiles */}
              {seller.reviewsCount > 0 && (
                <div className="flex items-center gap-1 text-sm mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= Math.round(seller.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-secondary-300'}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-secondary-900">{seller.averageRating.toFixed(1)}</span>
                  <span className="text-secondary-500">({seller.reviewsCount} avis)</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-sm text-secondary-600 mb-2">
                <MapPin size={14} />
                <span>{seller.location}</span>
              </div>

              <div className="flex items-center gap-1 text-sm text-secondary-600 mb-3">
                <Calendar size={14} />
                <span>Membre depuis {seller.memberSince}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-primary-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-primary-600">{seller.activeListings}</div>
                  <div className="text-xs text-secondary-600">Annonces</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-blue-600">{seller.totalViews}</div>
                  <div className="text-xs text-secondary-600">Vues</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2">
                  <div className="text-lg font-bold text-yellow-600">{seller.averageRating.toFixed(1)}</div>
                  <div className="text-xs text-secondary-600">{seller.reviewsCount} avis</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio/Description */}
          {seller.bio && (
            <div className="pt-4 border-t border-secondary-200">
              <h3 className="font-semibold mb-2">À propos</h3>
              <p className="text-sm text-secondary-700 leading-relaxed">
                {seller.bio}
              </p>
            </div>
          )}

          {/* Boutons de contact */}
          {(seller.phone || seller.whatsappPhone) ? (
            <div className="pt-4 flex flex-wrap gap-2">
              {/* WhatsApp */}
              {seller.whatsappPhone && (
                <button
                  onClick={() => {
                    const message = `Bonjour ${seller.firstName}, je suis intéressé par vos annonces sur Plan B.`;
                    openWhatsApp(seller.whatsappPhone, message);
                  }}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 px-4 bg-green-500/10 hover:bg-green-500/20 text-green-700 border border-green-500/30 rounded-xl transition-all"
                >
                  <MessageCircle size={18} />
                  <span className="text-sm font-medium">WhatsApp</span>
                </button>
              )}
              
              {/* Appeler */}
              {seller.phone && (
                <button
                  onClick={() => window.location.href = `tel:${seller.phone}`}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 px-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 border border-blue-500/30 rounded-xl transition-all"
                >
                  <Phone size={18} />
                  <span className="text-sm font-medium">Appeler</span>
                </button>
              )}
              
              {/* SMS */}
              {seller.phone && (
                <button
                  onClick={() => {
                    const message = `Bonjour ${seller.firstName}, je suis intéressé par vos annonces sur Plan B.`;
                    window.location.href = `sms:${seller.phone}?body=${encodeURIComponent(message)}`;
                  }}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 px-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 border border-purple-500/30 rounded-xl transition-all"
                >
                  <MessageSquare size={18} />
                  <span className="text-sm font-medium">SMS</span>
                </button>
              )}
            </div>
          ) : (
            <div className="pt-4">
              <p className="text-sm text-secondary-500 text-center italic">
                Pas de numéro de contact disponible
              </p>
            </div>
          )}
        </GlassCard>

        {/* Filtres par catégorie */}
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white/80 text-secondary-600 hover:bg-white'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Annonces du vendeur */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            {selectedCategory === 'all' ? 'Toutes les annonces' : categories.find(c => c.id === selectedCategory)?.label}
          </h3>
          
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredListings.map((listing, index) => (
                <ListingCard 
                  key={listing.id} 
                  listing={{
                    ...listing,
                    user: {
                      id: seller.id,
                      firstName: seller.firstName,
                      lastName: seller.lastName,
                      name: seller.name,
                      isPro: seller.isPro,
                      averageRating: seller.averageRating,
                      reviewsCount: seller.reviewsCount
                    }
                  }} 
                  index={index}
                  compact
                />
              ))}
            </div>
          ) : (
            <GlassCard>
              <p className="text-center text-secondary-600 py-8">
                Aucune annonce dans cette catégorie
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
