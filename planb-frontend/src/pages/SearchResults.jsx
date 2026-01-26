import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, SlidersHorizontal, SearchX } from 'lucide-react';
import MobileContainer from '../components/layout/MobileContainer';
import ListingCard from '../components/listing/ListingCard';
import PlanBLoader from '../components/animations/PlanBLoader';
import { listingsAPI } from '../api/listings';

/**
 * Page de résultats de recherche
 */
export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [localQuery, setLocalQuery] = useState(query); // État local pour input

  // Charger les résultats quand la query URL change
  useEffect(() => {
    if (query) {
      searchListings(query);
      setLocalQuery(query);
    }
  }, [query]);

  // Debounce pour la recherche (300ms - plus rapide)
  useEffect(() => {
    if (localQuery && localQuery !== query) {
      const timer = setTimeout(() => {
        navigate(`/search?q=${encodeURIComponent(localQuery)}`);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [localQuery, query, navigate]);

  const searchListings = async (searchQuery) => {
    try {
      // Ne pas montrer loading si on a déjà des résultats
      if (listings.length === 0) {
        setLoading(true);
      }
      // Utilise le cache automatique via listingsAPI
      const response = await listingsAPI.getListings({ search: searchQuery });
      setListings(response.data || []);
      setTotalResults(response.data?.length || 0);
    } catch (error) {
      console.error('Erreur recherche:', error);
      setListings([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer
      headerProps={{
        showLogo: false,
        title: 'Résultats de recherche',
        showBack: true,
      }}
    >
      <div className="space-y-4">
        {/* Barre de recherche fixe */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg p-4 -mx-4 border-b border-gray-100">
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-700"
              placeholder="Rechercher..."
            />
          </div>

          {/* Résumé */}
          {!loading && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{totalResults}</span> résultat{totalResults > 1 ? 's' : ''} pour
              <span className="font-semibold text-primary-500"> "{query}"</span>
            </div>
          )}
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Recherche en cours...</span>
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 lg:gap-6 pb-4">
            {listings.map((listing, index) => (
              <ListingCard key={listing.id} listing={listing} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <SearchX size={64} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aucun résultat pour "{query}"
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez avec d'autres mots-clés ou modifiez vos filtres
            </p>

            {/* Suggestions */}
            <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto">
              <h4 className="font-semibold text-gray-900 mb-3">Suggestions :</h4>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li>• Vérifiez l'orthographe</li>
                <li>• Utilisez des termes plus généraux</li>
                <li>• Essayez avec moins de mots-clés</li>
                <li>• Parcourez les catégories</li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
