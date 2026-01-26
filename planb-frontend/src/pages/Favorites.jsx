import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Lightbulb, Trash2 } from 'lucide-react';
import MobileContainer from '../components/layout/MobileContainer';
import ListingCard from '../components/listing/ListingCard';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import { getFavoriteListings, clearFavorites, removeFavorite } from '../utils/favorites';
import { getAllListings } from '../utils/listings';
import PlanBLoader from '../components/animations/PlanBLoader';

/**
 * Page des annonces favorites
 */
export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les favoris au montage
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const allListings = await getAllListings();
      const favoriteListings = getFavoriteListings(allListings);
      setFavorites(favoriteListings);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (id) => {
    removeFavorite(id);
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer tous vos favoris ?')) {
      clearFavorites();
      setFavorites([]);
    }
  };

  // Gérer le clic sur le cœur (défavoriser)
  const handleFavoriteToggle = (id, isFavorite) => {
    if (!isFavorite) {
      // Si on défavorise, retirer de la liste
      handleRemoveFavorite(id);
    }
  };

  // Afficher le loader pendant le chargement
  if (loading) {
    return (
      <MobileContainer
        showHeader={true}
        headerProps={{
          showLogo: false,
          title: 'Mes Favoris',
          leftAction: (
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-secondary-900" />
            </button>
          )
        }}
      >
        <div className="flex items-center justify-center h-96">
          <PlanBLoader />
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer
      showHeader={true}
      headerProps={{
        showLogo: false,
        title: 'Mes Favoris',
        leftAction: (
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} className="text-secondary-900" />
          </button>
        )
      }}
    >
      <div className="space-y-4 pb-24">
        {/* En-tête */}
        {favorites.length > 0 && (
          <GlassCard className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart size={24} className="fill-red-500 text-red-500" />
              <div>
                <h2 className="font-bold text-secondary-900">
                  {favorites.length} {favorites.length > 1 ? 'annonces' : 'annonce'}
                </h2>
                <p className="text-sm text-secondary-600">
                  Vos annonces préférées
                </p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearAll}
              icon={<Trash2 size={16} />}
            >
              Tout supprimer
            </Button>
          </GlassCard>
        )}

        {/* Liste des favoris */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3 pb-24">
            {favorites.map((listing, index) => (
              <div key={listing.id} className="relative">
                <ListingCard
                  listing={listing}
                  index={index}
                  initialIsFavorite={true}
                  onFavoriteToggle={handleFavoriteToggle}
                />
                {/* Bouton supprimer - coin supérieur droit de la carte */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(listing.id);
                  }}
                  className="absolute -top-1 -right-1 z-20 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg border-2 border-white"
                  title="Supprimer des favoris"
                >
                  <Trash2 size={14} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* État vide */
          <GlassCard className="text-center py-12">
            <div className="mb-4">
              <Heart size={64} className="mx-auto text-secondary-300" />
            </div>
            <h3 className="text-xl font-bold text-secondary-900 mb-2">
              Aucun favori
            </h3>
            <p className="text-secondary-600 mb-6">
              Vous n'avez pas encore ajouté d'annonces à vos favoris
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/')}
            >
              Découvrir les annonces
            </Button>
          </GlassCard>
        )}

        {/* Info bulle */}
        {favorites.length > 0 && (
          <GlassCard className="bg-blue-50/80 border-blue-200">
            <div className="flex gap-3">
              <Lightbulb size={28} className="text-blue-500" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">Astuce</h4>
                <p className="text-sm text-blue-700">
                  Cliquez sur le cœur <Heart size={14} className="inline text-red-500 fill-red-500" /> d'une annonce pour l'ajouter à vos favoris.
                  Vos favoris sont sauvegardés localement sur votre appareil.
                </p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </MobileContainer>
  );
}
