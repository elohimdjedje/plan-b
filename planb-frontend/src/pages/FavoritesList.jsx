import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Loader2, Package, MapPin, Eye, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites } from '../hooks/useFavorites';
import FavoriteButton from '../components/favorites/FavoriteButton';
import { getImageUrl } from '../utils/images';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Page liste des favoris
 * Affiche toutes les annonces favorites de l'utilisateur
 */
const FavoritesList = () => {
  const navigate = useNavigate();
  const { favorites, loading, refresh } = useFavorites();

  const handleListingClick = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  const handleFavoriteToggle = () => {
    // Rafraîchir la liste après modification
    refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de vos favoris...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="text-red-500 fill-red-500" size={28} />
                Mes favoris
              </h1>
              <p className="text-sm text-gray-600">
                {favorites.length} {favorites.length > 1 ? 'annonces' : 'annonce'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {favorites.length === 0 ? (
          /* État vide */
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={48} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Aucun favori pour le moment
            </h2>
            <p className="text-gray-600 mb-8">
              Ajoutez des annonces en favoris pour les retrouver facilement
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              Découvrir les annonces
            </button>
          </div>
        ) : (
          /* Grille des favoris */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {favorites.map((favorite, index) => {
                const listing = favorite.listing;
                
                return (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                      {/* Image */}
                      <div 
                        className="relative h-48 bg-gray-200 cursor-pointer overflow-hidden"
                        onClick={() => handleListingClick(listing.id)}
                      >
                        {listing.mainImage ? (
                          <img
                            src={getImageUrl(listing.mainImage)}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={64} className="text-gray-400" />
                          </div>
                        )}

                        {/* Badge statut */}
                        <div className="absolute top-3 left-3">
                          <span className={`
                            px-3 py-1 rounded-full text-xs font-semibold
                            ${listing.status === 'active' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-500 text-white'
                            }
                          `}>
                            {listing.status === 'active' ? 'Actif' : listing.status}
                          </span>
                        </div>

                        {/* Bouton favori */}
                        <div className="absolute top-3 right-3">
                          <FavoriteButton
                            listingId={listing.id}
                            initialIsFavorite={true}
                            size="default"
                            variant="default"
                            onToggle={handleFavoriteToggle}
                          />
                        </div>
                      </div>

                      {/* Contenu */}
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => handleListingClick(listing.id)}
                      >
                        {/* Titre */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
                          {listing.title}
                        </h3>

                        {/* Prix */}
                        <div className="mb-3">
                          <span className="text-2xl font-bold text-orange-500">
                            {listing.price.toLocaleString('fr-FR')}
                          </span>
                          <span className="text-gray-600 ml-1">{listing.currency}</span>
                        </div>

                        {/* Localisation */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <MapPin size={16} />
                          <span>{listing.city}, {listing.country}</span>
                        </div>

                        {/* Catégorie */}
                        <div className="mb-3">
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                            {listing.category}
                          </span>
                        </div>

                        {/* Vendeur */}
                        {listing.seller && (
                          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-gray-700">
                                {listing.seller.fullName?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {listing.seller.fullName}
                              </p>
                              {listing.seller.isPro && (
                                <span className="text-xs text-orange-500 font-semibold">PRO</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye size={14} />
                            {listing.viewsCount || 0} vues
                          </span>
                          <span>
                            {formatDistanceToNow(new Date(listing.createdAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Info */}
      {favorites.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-3">
            <Heart size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-900 mb-1">
                À propos des favoris
              </h4>
              <p className="text-sm text-orange-700">
                Vos favoris sont sauvegardés et accessibles depuis n'importe quel appareil. 
                Cliquez sur le cœur pour retirer une annonce de vos favoris.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesList;
