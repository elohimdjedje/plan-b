import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Heart, LogOut, Crown, TrendingUp, Eye, MoreVertical, Trash2, Calendar, Edit, CheckCircle2, RefreshCw, Home, Key, Star, Shield } from 'lucide-react';
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
import { getUserProfile } from '../utils/auth';
import { listingsAPI } from '../api/listings';
import api from '../api/axios';
import {
  updateListing,
  deleteListing,
  getAllListings
} from '../utils/listings';
import { checkFavoritesChanges } from '../utils/notifications';
import { getImageUrl, IMAGE_PLACEHOLDER } from '../utils/images';
import PlanBLoader from '../components/animations/PlanBLoader';
import { getDrafts, deleteDraft } from '../services/draftsService';

/**
 * Page Profil utilisateur
 */
export default function Profile() {
  const navigate = useNavigate();
  const { user, accountType = 'FREE', logout, updateUser, upgradeToPro } = useAuthStore();
  const [activeTab, setActiveTab] = useState('active'); // active, expired, sold, drafts
  const [openMenuId, setOpenMenuId] = useState(null); // ID de l'annonce dont le menu est ouvert
  const [listings, setListings] = useState([]); // État pour gérer les annonces
  const [drafts, setDrafts] = useState([]); // État pour les brouillons
  const [subscription, setSubscription] = useState(null);
  // Initialiser hasPro depuis le store pour affichage immédiat
  const [hasPro, setHasPro] = useState(accountType === 'PRO' || user?.isPro || user?.accountType === 'PRO');
  // Vérifier si les données du store sont complètes
  const hasCompleteUserData = user?.firstName && user?.lastName;
  // Utiliser l'utilisateur du store immédiatement seulement si données complètes
  const [currentUserProfile, setCurrentUserProfile] = useState(hasCompleteUserData ? user : null);
  // Loading si pas de données complètes
  const [loading, setLoading] = useState(!hasCompleteUserData);

  useEffect(() => {
    // Charger les données fraîches en arrière-plan
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // IMPORTANT: Toujours récupérer l'utilisateur depuis l'API (pas le cache)
      // Cela garantit que les annonces correspondent au bon utilisateur
      const currentUser = await getUserProfile();

      if (!currentUser) {
        // Si pas d'utilisateur, rediriger vers la connexion
        navigate('/auth');
        return;
      }

      // Vérifier la cohérence: l'utilisateur du store correspond-il à l'utilisateur de l'API?
      if (user?.id && user.id !== currentUser.id) {
        console.warn('[PROFILE] Incohérence détectée! Store user:', user.id, 'API user:', currentUser.id);
        // Forcer la mise à jour du store avec les bonnes données
        logout();
        navigate('/auth');
        return;
      }

      // Charger les statistiques d'avis du vendeur (en parallèle, non-bloquant)
      api.get(`/reviews/seller/${currentUser.id}`)
        .then(reviewsResponse => {
          setCurrentUserProfile(prev => ({
            ...prev,
            averageRating: reviewsResponse.data.stats?.averageRating || 0,
            reviewsCount: reviewsResponse.data.stats?.totalReviews || 0
          }));
        })
        .catch(() => { });

      setCurrentUserProfile(currentUser);

      // Mettre à jour le store avec les données fraîches pour le cache
      updateUser(currentUser);

      // Vérifier si l'utilisateur est PRO
      const isPro = currentUser?.accountType === 'PRO' || currentUser?.isPro === true;
      setHasPro(isPro);

      // Synchroniser le store avec le statut PRO du backend
      if (isPro && accountType !== 'PRO') {
        upgradeToPro();
      }

      // Charger les annonces de l'utilisateur
      try {
        const response = await listingsAPI.getMyListings();
        setListings(response.listings || []);
      } catch (err) {
        setListings([]);
      }

      // Charger les brouillons depuis le localStorage
      const savedDrafts = getDrafts();
      setDrafts(savedDrafts);

    } catch (error) {
      // Si erreur et pas d'utilisateur en cache, rediriger
      if (!user) {
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  // Utiliser le profil réel de l'utilisateur
  const displayUser = currentUserProfile || user;

  // Afficher loader si en cours de chargement ou si pas d'utilisateur
  if (loading || !displayUser) {
    return <PlanBLoader />;
  }

  // Utiliser les annonces chargées
  const currentListings = listings || [];

  // Fonction pour vérifier si une annonce est expirée
  const isExpired = (listing) => {
    if (listing.status === 'expired') return true;
    if (listing.expiresAt) {
      return new Date(listing.expiresAt) < new Date();
    }
    return false;
  };

  const filteredListings = activeTab === 'drafts' 
    ? [] // Les brouillons sont gérés séparément
    : currentListings.filter(l => {
        if (activeTab === 'active') return l.status === 'active' && !isExpired(l);
        if (activeTab === 'expired') return isExpired(l);
        if (activeTab === 'sold') return l.status === 'sold';
        return true;
      });

  // Calculer les statistiques réelles (exclure les annonces expirées)
  const realStats = {
    // Nombre total d'annonces vraiment actives (pas expirées)
    listings: currentListings.filter(l => l.status === 'active' && !isExpired(l)).length,
    // Somme de toutes les vues de toutes les annonces
    views: currentListings.reduce((total, listing) => total + (listing.viewsCount || 0), 0)
  };

  // Supprimer un brouillon
  const handleDeleteDraft = (draftId) => {
    if (window.confirm('Supprimer ce brouillon ?')) {
      deleteDraft(draftId);
      setDrafts(getDrafts());
      toast.success('Brouillon supprimé');
    }
  };

  // Publier un brouillon (rediriger vers Publish avec les données pré-remplies)
  const handlePublishDraft = (draft) => {
    // Stocker le brouillon à publier dans sessionStorage
    sessionStorage.setItem('draft_to_publish', JSON.stringify(draft));
    navigate('/publish?from=draft&id=' + draft.id);
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
      // ⚡ Fermer le menu et mettre à jour l'UI immédiatement
      setOpenMenuId(null);
      setListings((prev) => prev.filter(l => l.id !== listingId));
      toast.success('✅ Annonce supprimée');

      // 🔄 Appel API en arrière-plan
      try {
        await deleteListing(listingId);
      } catch (error) {
        console.error('Erreur suppression:', error);
        toast.error('❌ Erreur lors de la suppression');
        loadUserData(); // Recharger pour restaurer l'état correct
      }
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
      // ⚡ Fermer le menu et mettre à jour l'UI immédiatement
      setOpenMenuId(null);
      setListings((prev) => prev.map(l =>
        l.id === listingId ? { ...l, status: 'sold' } : l
      ));
      toast.success(successMsg);

      // 🔄 Appel API en arrière-plan
      try {
        await updateListing(listingId, { status: 'sold' });
      } catch (error) {
        console.error('Erreur mise à jour:', error);
        toast.error('❌ Erreur lors de la mise à jour');
        loadUserData(); // Recharger pour restaurer l'état correct
      }
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
        // ⚡ Fermer le menu et mettre à jour l'UI immédiatement
        setOpenMenuId(null);
        setListings((prev) => prev.map(l =>
          l.id === listingId ? { ...l, status: 'active', createdAt: new Date().toISOString() } : l
        ));
        setActiveTab('active');
        toast.success('✅ Annonce republiée avec succès !');

        // 🔄 Appel API en arrière-plan
        try {
          await updateListing(listingId, { status: 'active' });
        } catch (error) {
          console.error('Erreur republication:', error);
          toast.error('❌ Erreur lors de la republication');
          loadUserData(); // Recharger pour restaurer l'état correct
        }
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
              <div className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold ${(hasPro || accountType === 'PRO')
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
              {displayUser?.nationality && (
                <p className="text-white/70 text-xs mt-1">🌍 {displayUser.nationality}</p>
              )}
              {displayUser?.phone && (
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
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">À propos</h3>
            <button
              onClick={() => navigate('/settings')}
              className="text-primary-500 text-sm hover:underline"
            >
              Modifier
            </button>
          </div>
          {displayUser.bio ? (
            <p className="text-secondary-700 leading-relaxed whitespace-pre-line">
              {displayUser.bio}
            </p>
          ) : (
            <button
              onClick={() => navigate('/settings')}
              className="w-full py-4 border-2 border-dashed border-secondary-300 rounded-xl text-secondary-500 hover:border-primary-400 hover:text-primary-500 transition-colors"
            >
              + Ajouter une bio pour vous présenter
            </button>
          )}
        </GlassCard>

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
                    Expire dans {getDaysRemaining(currentUserProfile)} jour{getDaysRemaining(currentUserProfile) > 1 ? 's' : ''}
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
              // Onglet Expirées pour tous les utilisateurs
              { id: 'expired', label: 'Expirées', icon: '⏱' },
              { id: 'sold', label: 'Vendues', icon: '✔' },
              // Onglet Brouillons si il y en a
              ...(drafts.length > 0 ? [{ id: 'drafts', label: `Brouillons (${drafts.length})`, icon: '📝' }] : []),
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
            ) : activeTab === 'drafts' ? (
              // Affichage des brouillons
              drafts.length > 0 ? (
                drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="relative flex gap-3 p-3 bg-amber-50/50 rounded-xl hover:bg-amber-50 transition-all border border-amber-200/50"
                  >
                    {/* Image placeholder - les previews blob: ne persistent pas */}
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">📝</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-[10px] font-bold rounded-full">
                          BROUILLON
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm line-clamp-1 text-secondary-900">
                        {draft.title || 'Sans titre'}
                      </h4>
                      <p className="text-primary-500 font-bold text-sm">
                        {draft.price ? `${formatPrice(draft.price)} FCFA` : 'Prix non défini'}
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">
                        Sauvegardé {formatRelativeDate(draft.createdAt)}
                      </p>
                      <p className="text-[10px] text-amber-600 mt-0.5">
                        📷 Ajoutez vos photos pour publier
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handlePublishDraft(draft)}
                        className="px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        Compléter
                      </button>
                      <button
                        onClick={() => handleDeleteDraft(draft.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-secondary-500">
                  <p>Aucun brouillon</p>
                </div>
              )
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
            {/* Bouton Admin - visible uniquement pour les admins */}
            {(user?.roles?.includes('ROLE_ADMIN') || currentUserProfile?.roles?.includes('ROLE_ADMIN')) && (
              <button
                onClick={() => navigate('/admin')}
                className="w-full p-3 md:p-4 text-left text-purple-700 hover:bg-purple-500/10 backdrop-blur-sm rounded-xl transition-all flex items-center gap-3 border border-purple-300 hover:border-purple-500"
              >
                <Shield size={20} />
                <span className="font-medium">Dashboard Admin</span>
                <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Admin</span>
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
