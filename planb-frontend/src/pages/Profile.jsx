import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Heart, LogOut, Crown, TrendingUp, Eye, MoreVertical, Trash2, Calendar, Edit, CheckCircle2, RefreshCw, Home, Key, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileContainer from '../components/layout/MobileContainer';
import GlassCard from '../components/common/GlassCard';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import StarRating from '../components/common/StarRating';
import { useAuthStore } from '../store/authStore';
import { formatPrice, formatRelativeDate } from '../utils/format';
import { toast } from 'react-hot-toast';
import { 
  getSubscription, 
  isSubscriptionActive, 
  getDaysRemaining,
  updateSubscriptionStatus 
} from '../utils/subscription';
import { getCurrentUser, getUserProfile } from '../utils/auth';
import { listingsAPI } from '../api/listings';
import api from '../api/axios';
import { 
  updateListing, 
  deleteListing
} from '../utils/listings';
import { checkFavoritesChanges } from '../utils/notifications';
import { getImageUrl, IMAGE_PLACEHOLDER } from '../utils/images';

/**
 * Page Profil utilisateur
 */
export default function Profile() {
  const navigate = useNavigate();
  const { user, accountType = 'FREE', logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('active'); // active, expired, sold
  const [openMenuId, setOpenMenuId] = useState(null); // ID de l'annonce dont le menu est ouvert
  const [listings, setListings] = useState([]); // État pour gérer les annonces (initialisé à [] au lieu de null)
  const [subscription, setSubscription] = useState(null);
  const [hasPro, setHasPro] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    
    // Timeout de sécurité pour éviter le chargement infini
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Timeout chargement profil - affichage forcé');
        setLoading(false);
      }
    }, 2000); // 2 secondes max
    
    return () => clearTimeout(timeout);
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'utilisateur réel depuis l'API
      const currentUser = await getUserProfile();
      
      if (!currentUser) {
        // Si pas d'utilisateur, rediriger vers la connexion
        navigate('/auth');
        return;
      }
      
      // Charger les statistiques d'avis du vendeur
      try {
        const reviewsResponse = await api.get(`/reviews/seller/${currentUser.id}`);
        currentUser.averageRating = reviewsResponse.data.stats?.averageRating || 0;
        currentUser.reviewsCount = reviewsResponse.data.stats?.totalReviews || 0;
      } catch (err) {
        console.error('Erreur chargement avis:', err);
        currentUser.averageRating = 0;
        currentUser.reviewsCount = 0;
      }

      setCurrentUserProfile(currentUser);
      
      // Vérifier l'abonnement
      const sub = getSubscription(currentUser);
      setSubscription(sub);
      setHasPro(sub?.isActive || false);
      
      // Charger les annonces de l'utilisateur
      try {
        const response = await listingsAPI.getMyListings();
        setListings(response.listings || []);
      } catch (err) {
        console.error('Erreur chargement annonces:', err);
        setListings([]);
      }
      
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      // Rediriger vers la connexion en cas d'erreur
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  // Utiliser le profil réel de l'utilisateur
  const displayUser = currentUserProfile || user;

  // Afficher loader si en cours de chargement ou si pas d'utilisateur
  if (loading || !displayUser) {
    return (
      <MobileContainer headerProps={{ showLogo: false, title: 'Mon Profil' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du profil...</p>
          </div>
        </div>
      </MobileContainer>
    );
  }

  // Utiliser les annonces chargées
  const currentListings = listings || [];

  const filteredListings = currentListings.filter(l => {
    if (activeTab === 'active') return l.status === 'active';
    if (activeTab === 'expired') return l.status === 'expired';
    if (activeTab === 'sold') return l.status === 'sold';
    return true;
  });

  // Calculer les statistiques réelles
  const realStats = {
    // Nombre total d'annonces actives
    listings: currentListings.filter(l => l.status === 'active').length,
    // Somme de toutes les vues de toutes les annonces
    views: currentListings.reduce((total, listing) => total + (listing.viewsCount || 0), 0)
  };

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
      navigate('/auth');
    }
  };

  const handleEditListing = (listingId) => {
    setOpenMenuId(null);
    navigate(`/edit-listing/${listingId}`);
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      // Supprimer de localStorage
      deleteListing(listingId);
      
      // Mettre à jour l'état local
      setListings((prev) => (prev || mockListings).filter(l => l.id !== listingId));
      
      // Vérifier les changements pour notifier les favoris
      const updatedListings = await getAllListings();
      checkFavoritesChanges(updatedListings);
      
      toast.success('✅ Annonce supprimée');
      setOpenMenuId(null);
    }
  };

  const handleMarkAsSold = async (listingId) => {
    const listing = currentListings.find(l => l.id === listingId);
    if (!listing) return;
    
    const isRental = listing.type === 'location' || listing.category === 'location';
    const message = isRental 
      ? 'Marquer cette location comme occupée ?' 
      : 'Marquer cette annonce comme vendue ?';
    const successMsg = isRental 
      ? '✅ Location marquée comme occupée' 
      : '✅ Annonce marquée comme vendue';
    
    if (window.confirm(message)) {
      // Mettre à jour dans localStorage
      updateListing(listingId, { status: 'sold' });
      
      // Mettre à jour l'état local
      setListings((prev) => (prev || mockListings).map(l => 
        l.id === listingId ? { ...l, status: 'sold' } : l
      ));
      
      // Vérifier les changements pour notifier les favoris
      const updatedListings = await getAllListings();
      checkFavoritesChanges(updatedListings);
      
      toast.success(successMsg);
      setOpenMenuId(null);
    }
  };

  const handleRepublish = async (listingId) => {
    if (!hasPro && accountType !== 'PRO') {
      // FREE : Paiement requis pour republier
      if (window.confirm('Republier cette annonce coûte 1 500 FCFA. Continuer ?')) {
        navigate(`/payment/republish?listingId=${listingId}&amount=1500`);
      }
    } else {
      // PRO : Republier gratuitement
      if (window.confirm('Republier cette annonce ?')) {
        updateListing(listingId, { 
          status: 'active',
          createdAt: new Date().toISOString() 
        });
        
        setListings((prev) => (prev || mockListings).map(l => 
          l.id === listingId ? { ...l, status: 'active', createdAt: new Date().toISOString() } : l
        ));
        
        // Vérifier les changements pour notifier les favoris
        const updatedListings = await getAllListings();
        checkFavoritesChanges(updatedListings);
        
        toast.success('✅ Annonce republiée avec succès !');
        setOpenMenuId(null);
        setActiveTab('active');
      }
    }
  };

  const toggleMenu = (listingId) => {
    setOpenMenuId(openMenuId === listingId ? null : listingId);
  };

  return (
    <MobileContainer headerProps={{ showLogo: false, title: 'Mon Profil' }}>
      <div className="space-y-4 md:space-y-6 pb-8 md:pb-12">
        {/* En-tête profil */}
        <GlassCard className="bg-gradient-to-br from-primary-400 to-primary-600 border-none">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Cercle avec initiales */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center text-primary-600 text-2xl md:text-3xl font-bold">
                {displayUser?.fullName ? 
                  displayUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase() :
                  displayUser?.firstName ? 
                    (displayUser.firstName[0] + (displayUser.lastName?.[0] || '')).toUpperCase() :
                    'U'
                }
              </div>
              {/* Badge statut */}
              <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                (hasPro || accountType === 'PRO')
                  ? 'bg-yellow-400 text-yellow-900' 
                  : 'bg-white text-secondary-600'
              }`}>
                {(hasPro || accountType === 'PRO') ? 'PRO' : 'FREE'}
              </div>
            </div>
            <div className="flex-1 text-white">
              <h2 className="text-xl font-bold">
                {displayUser?.fullName || `${displayUser?.firstName || ''} ${displayUser?.lastName || ''}`.trim() || 'Utilisateur'}
              </h2>
              <p className="text-white/80 text-sm">{displayUser?.email || ''}</p>
              {displayUser.phone && (
                <p className="text-white/70 text-xs mt-1">{displayUser.phone}</p>
              )}
              {(hasPro || accountType === 'PRO') && (
                <div className="flex items-center gap-1 mt-2">
                  <Crown size={14} className="text-yellow-300" />
                  <span className="text-xs text-yellow-100">Certifié PRO</span>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Statistiques - Pour tous (FREE et PRO) */}
        <div className="grid grid-cols-3 gap-3">
          <GlassCard className="text-center" padding="p-4">
            <div className="text-2xl mb-1">
              <Eye size={24} className="mx-auto text-primary-500" />
            </div>
            <div className="text-2xl font-bold text-secondary-900">{realStats.views.toLocaleString()}</div>
            <div className="text-xs text-secondary-600">Vues totales</div>
          </GlassCard>
          <GlassCard className="text-center" padding="p-4">
            <div className="text-2xl mb-1">
              <TrendingUp size={24} className="mx-auto text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-secondary-900">{realStats.listings}</div>
            <div className="text-xs text-secondary-600">Annonces actives</div>
          </GlassCard>
          <GlassCard className="text-center" padding="p-4">
            <div className="text-2xl mb-1">
              <Star size={24} className="mx-auto text-yellow-400" fill="currentColor" />
            </div>
            <div className="text-2xl font-bold text-secondary-900">
              {currentUserProfile?.averageRating ? currentUserProfile.averageRating.toFixed(1) : '0.0'}
            </div>
            <div className="text-xs text-secondary-600">
              {currentUserProfile?.reviewsCount || 0} avis
            </div>
          </GlassCard>
        </div>

        {/* Bio/Description de l'utilisateur */}
        {displayUser.bio && (
          <GlassCard>
            <h3 className="font-semibold text-lg mb-3">À propos</h3>
            <p className="text-secondary-700 leading-relaxed whitespace-pre-line">
              {displayUser.bio}
            </p>
          </GlassCard>
        )}

        {/* Section abonnement */}
        {!hasPro ? (
          /* Upgrade PRO (si FREE) */
          <GlassCard className="bg-gradient-to-r from-yellow-400 to-orange-500 border-none" padding="p-6">
            <div className="flex items-start gap-3">
              <Crown size={32} className="text-white flex-shrink-0" />
              <div className="flex-1 text-white">
                <h3 className="text-xl font-bold mb-2">Passez en PRO</h3>
                <p className="text-white/90 text-sm mb-3">
                  Annonces illimitées, badge vérifié et statistiques détaillées
                </p>
                <div className="text-2xl font-bold mb-3">10 000 FCFA/mois</div>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => navigate('/upgrade')}
                >
                  Débloquer maintenant
                </Button>
              </div>
            </div>
          </GlassCard>
        ) : (
          /* Mon abonnement (si PRO) */
          <GlassCard className="bg-gradient-to-r from-yellow-400 to-orange-500 border-none" padding="p-6">
            <div className="flex items-start gap-3">
              <Crown size={32} className="text-white flex-shrink-0" />
              <div className="flex-1 text-white">
                <h3 className="text-xl font-bold mb-2">Compte PRO Actif</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} />
                  <span className="text-white/90 text-sm">
                    Expire dans {getDaysRemaining()} jour{getDaysRemaining() > 1 ? 's' : ''}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => navigate('/my-subscription')}
                >
                  Voir mon abonnement
                </Button>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Mes annonces */}
        <GlassCard>
          <h3 className="font-semibold text-lg mb-4">
            Mes annonces ({listings.length})
          </h3>
          
          {/* Tabs - Filtres des annonces */}
          <div className="flex gap-2 md:gap-3 mb-4 md:mb-6 overflow-x-auto scrollbar-hide pb-2">
            {[
              { id: 'active', label: 'Actives', icon: '✓' },
              // FREE a les annonces expirées, PRO n'a pas de limite
              ...(!hasPro && accountType !== 'PRO' ? [{ id: 'expired', label: 'Expirées', icon: '⏱' }] : []),
              { id: 'sold', label: 'Vendues', icon: '✔' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-sm md:text-base font-semibold whitespace-nowrap transition-all flex-shrink-0
                  ${activeTab === tab.id
                    ? 'bg-primary-500/90 backdrop-blur-md text-white shadow-lg scale-105 border border-white/20'
                    : 'bg-white/60 backdrop-blur-lg text-secondary-700 hover:bg-white/80 border border-white/30'
                  }
                `}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Liste des annonces */}
          <div className="space-y-3">
            {filteredListings.length > 0 ? (
              filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="relative flex gap-3 p-3 bg-white/50 rounded-xl hover:bg-white/70 transition-all"
                >
                  <img
                    src={getImageUrl(listing.mainImage) || IMAGE_PLACEHOLDER}
                    alt={listing.title}
                    className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                    onClick={() => navigate(`/listing/${listing.id}`)}
                  />
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/listing/${listing.id}`)}
                  >
                    <h4 className="font-semibold text-sm line-clamp-1 text-secondary-900">
                      {listing.title}
                    </h4>
                    <p className="text-primary-500 font-bold text-sm">
                      {formatPrice(listing.price)} FCFA
                    </p>
                    <div className="flex items-center gap-2 text-xs text-secondary-500 mt-1">
                      <Eye size={12} />
                      <span>{listing.viewsCount || 0} vues</span>
                      <span>•</span>
                      <span>{formatRelativeDate(listing.createdAt)}</span>
                    </div>
                  </div>
                  
                  {/* Bouton menu trois points */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(listing.id);
                      }}
                      className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                    >
                      <MoreVertical size={20} className="text-secondary-600" />
                    </button>

                    {/* Menu déroulant */}
                    <AnimatePresence>
                      {openMenuId === listing.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 bottom-full mb-2 z-20 w-52 bg-white rounded-xl shadow-xl border border-secondary-200 overflow-hidden"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditListing(listing.id);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-secondary-50 transition-colors flex items-center gap-3 text-secondary-700"
                          >
                            <Edit size={18} />
                            <span className="font-medium">Modifier</span>
                            {!hasPro && accountType !== 'PRO' && (
                              <span className="ml-auto text-xs text-primary-500 font-semibold">1 500 F</span>
                            )}
                          </button>
                          
                          {listing.status === 'active' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsSold(listing.id);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center gap-3 text-green-600 border-t border-secondary-100"
                            >
                              {(listing.type === 'location' || listing.category === 'location') ? (
                                <>
                                  <Key size={18} />
                                  <span className="font-medium">Marquer comme occupé</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={18} />
                                  <span className="font-medium">Marquer comme vendu</span>
                                </>
                              )}
                            </button>
                          )}
                          
                          {listing.status === 'expired' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRepublish(listing.id);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 text-blue-600 border-t border-secondary-100"
                            >
                              <RefreshCw size={18} />
                              <span className="font-medium">Republier</span>
                              {!hasPro && accountType !== 'PRO' && (
                                <span className="ml-auto text-xs text-primary-500 font-semibold">1 500 F</span>
                              )}
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteListing(listing.id);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600 border-t border-secondary-100"
                          >
                            <Trash2 size={18} />
                            <span className="font-medium">Supprimer</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-secondary-500">
                <p>Aucune annonce {activeTab === 'active' ? 'active' : activeTab}</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Actions */}
        <GlassCard>
          <h3 className="font-semibold text-lg mb-4">Paramètres</h3>
          <div className="space-y-2 md:space-y-3">
            <button
              onClick={() => navigate('/settings')}
              className="w-full p-3 md:p-4 text-left text-secondary-700 hover:bg-white/60 backdrop-blur-sm rounded-xl transition-all flex items-center gap-3 border border-transparent hover:border-white/40"
            >
              <Settings size={20} />
              <span className="font-medium">Paramètres du compte</span>
            </button>
            <button
              onClick={() => navigate('/favorites')}
              className="w-full p-3 md:p-4 text-left text-secondary-700 hover:bg-white/60 backdrop-blur-sm rounded-xl transition-all flex items-center gap-3 border border-transparent hover:border-white/40"
            >
              <Heart size={20} />
              <span className="font-medium">Mes favoris</span>
            </button>
            {accountType === 'PRO' && (
              <button
                onClick={() => navigate('/stats')}
                className="w-full p-3 md:p-4 text-left text-secondary-700 hover:bg-white/60 backdrop-blur-sm rounded-xl transition-all flex items-center gap-3 border border-transparent hover:border-white/40"
              >
                <TrendingUp size={20} />
                <span className="font-medium">Mes statistiques</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full p-3 md:p-4 text-left text-red-600 font-semibold hover:bg-red-500/10 backdrop-blur-sm rounded-xl transition-all flex items-center gap-3 border-2 border-red-500/30 hover:border-red-500 hover:shadow-lg"
            >
              <LogOut size={22} />
              <span className="font-semibold"> Déconnexion</span>
            </button>
          </div>
        </GlassCard>
      </div>
    </MobileContainer>
  );
}
