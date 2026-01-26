import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, MapPin, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../../api/search';
import { listingsAPI } from '../../api/listings';

/**
 * Modal de recherche avancée style Le Bon Coin
 * Affiche l'historique des recherches et des suggestions
 */
export default function SearchModal({ isOpen, onClose, onSearch }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Charger l'historique au montage
  useEffect(() => {
    if (isOpen) {
      loadSearchHistory();
      loadPopularSearches();
      // Focus automatique sur l'input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Générer des suggestions pendant la saisie
  useEffect(() => {
    if (query.length >= 2) {
      generateSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Charger l'historique depuis localStorage
  const loadSearchHistory = () => {
    try {
      const stored = localStorage.getItem('planb_search_history');
      if (stored) {
        const history = JSON.parse(stored);
        // Nettoyer l'historique de plus de 24h
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const validHistory = history.filter(item => item.timestamp > oneDayAgo);

        if (validHistory.length !== history.length) {
          // Sauvegarder l'historique nettoyé
          localStorage.setItem('planb_search_history', JSON.stringify(validHistory));
        }

        setSearchHistory(validHistory.slice(0, 10)); // Max 10 dernières recherches
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      setSearchHistory([]);
    }
  };

  // Charger les recherches populaires
  const loadPopularSearches = async () => {
    try {
      const response = await searchAPI.getPopularSearches();
      setPopularSearches(response.popular || []);
    } catch (error) {
      console.error('Erreur chargement recherches populaires:', error);
      // Fallback sur des recherches par défaut en cas d'erreur
      setPopularSearches([
        { query: 'Villa à louer', count: 0 },
        { query: 'Voiture occasion', count: 0 },
        { query: 'Appartement Abidjan', count: 0 },
        { query: 'Terrain à vendre', count: 0 },
        { query: 'Hôtel Assinie', count: 0 },
      ]);
    }
  };

  // Générer des suggestions basées sur la requête
  const generateSuggestions = async (searchQuery) => {
    try {
      setLoading(true);

      // Appeler l'API pour obtenir des suggestions basées sur les titres réels
      const response = await searchAPI.getSuggestions(searchQuery);
      const titleSuggestions = response.suggestions || [];

      // Rechercher des annonces correspondantes pour obtenir plus d'infos
      const listingsResponse = await listingsAPI.getListings({
        search: searchQuery,
        limit: 8
      });
      const listings = listingsResponse.data || [];

      // Créer des suggestions enrichies
      const enrichedSuggestions = [];
      const seen = new Set();

      // D'abord, ajouter les suggestions de titres
      titleSuggestions.forEach(title => {
        if (!seen.has(title.toLowerCase())) {
          seen.add(title.toLowerCase());
          enrichedSuggestions.push({
            text: title,
            category: null,
            type: null,
            count: 1
          });
        }
      });

      // Ensuite, créer des suggestions basées sur les annonces
      listings.forEach(listing => {
        const suggestion = `${listing.title}`;
        if (!seen.has(suggestion.toLowerCase()) && enrichedSuggestions.length < 8) {
          seen.add(suggestion.toLowerCase());
          enrichedSuggestions.push({
            text: listing.title,
            category: listing.category,
            type: listing.type,
            count: 1
          });
        }
      });

      setSuggestions(enrichedSuggestions.slice(0, 8));
    } catch (error) {
      console.error('Erreur suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder une recherche dans l'historique
  const saveToHistory = (searchQuery) => {
    try {
      const stored = localStorage.getItem('planb_search_history');
      const history = stored ? JSON.parse(stored) : [];

      // Ajouter la nouvelle recherche
      const newEntry = {
        query: searchQuery,
        timestamp: Date.now(),
      };

      // Éviter les doublons
      const filtered = history.filter(item => item.query !== searchQuery);
      filtered.unshift(newEntry);

      // Limiter à 50 recherches max
      const limited = filtered.slice(0, 50);

      localStorage.setItem('planb_search_history', JSON.stringify(limited));
    } catch (error) {
      console.error('Erreur sauvegarde historique:', error);
    }
  };

  // Exécuter une recherche
  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;

    saveToHistory(searchQuery.trim());
    onClose();

    // Si on a une callback onSearch (depuis Home), l'utiliser
    if (onSearch) {
      onSearch(searchQuery.trim());
    } else {
      // Sinon, rediriger vers la page de recherche
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Supprimer une entrée de l'historique
  const deleteHistoryItem = (itemQuery) => {
    try {
      const stored = localStorage.getItem('planb_search_history');
      if (stored) {
        const history = JSON.parse(stored);
        const filtered = history.filter(item => item.query !== itemQuery);
        localStorage.setItem('planb_search_history', JSON.stringify(filtered));
        setSearchHistory(filtered.slice(0, 10));
      }
    } catch (error) {
      console.error('Erreur suppression historique:', error);
    }
  };

  // Effacer tout l'historique
  const clearHistory = () => {
    if (window.confirm('Effacer tout l\'historique de recherche ?')) {
      localStorage.removeItem('planb_search_history');
      setSearchHistory([]);
    }
  };

  // Formater le temps relatif
  const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (hours >= 1) {
      return `Il y a ${hours}h`;
    } else if (minutes >= 1) {
      return `Il y a ${minutes}min`;
    } else {
      return 'À l\'instant';
    }
  };

  // Formater le compteur d'annonces
  const formatCount = (count) => {
    if (count === 0) return '0 annonce';
    if (count === 1) return '1 annonce';
    return `${count} annonces`;
  };

  // Formater la catégorie et le type pour l'affichage
  const formatCategoryType = (category, type) => {
    if (!category && !type) return null;

    const categoryNames = {
      'immobilier': 'Immobilier',
      'vehicule': 'Véhicule',
      'vacance': 'Vacances'
    };

    const typeNames = {
      'vente': 'Vente',
      'location': 'Location',
      'recherche': 'Recherche'
    };

    const parts = [];
    if (category) parts.push(categoryNames[category] || category);
    if (type) parts.push(typeNames[type] || type);

    return parts.join(' • ');
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white min-h-screen md:min-h-0 md:max-h-[80vh] md:m-4 md:mx-auto md:max-w-3xl md:rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
            <div className="flex items-center gap-3">
              <Search size={20} className="text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Que recherchez-vous ?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
                className="flex-1 text-lg outline-none"
              />
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(100vh-80px)] md:max-h-[calc(80vh-80px)]">
            {query.length >= 2 ? (
              /* Suggestions */
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <Search size={16} />
                  Suggestions
                </h3>
                {loading ? (
                  <div className="text-center py-8 text-gray-400">
                    Recherche en cours...
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(suggestion.text)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <Search size={16} className="text-gray-400 group-hover:text-primary-500" />
                          <div>
                            <div className="font-medium text-gray-900">{suggestion.text}</div>
                            {formatCategoryType(suggestion.category, suggestion.type) && (
                              <div className="text-xs text-gray-500">
                                {formatCategoryType(suggestion.category, suggestion.type)}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{formatCount(suggestion.count)}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Aucune suggestion trouvée
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Historique */}
                {searchHistory.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                        <Clock size={16} />
                        Recherches récentes
                      </h3>
                      <button
                        onClick={clearHistory}
                        className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                      >
                        Effacer tout
                      </button>
                    </div>
                    <div className="space-y-1">
                      {searchHistory.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                        >
                          <button
                            onClick={() => handleSearch(item.query)}
                            className="flex-1 flex items-center gap-3 text-left"
                          >
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-gray-700">{item.query}</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{getTimeAgo(item.timestamp)}</span>
                            <button
                              onClick={() => deleteHistoryItem(item.query)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                            >
                              <X size={14} className="text-gray-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recherches populaires */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} />
                    Recherches populaires
                  </h3>
                  <div className="space-y-2">
                    {popularSearches.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(item.query)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <TrendingUp size={16} className="text-orange-400 group-hover:text-orange-500" />
                          <span className="font-medium text-gray-700">{item.query}</span>
                        </div>
                        <span className="text-xs text-gray-400">{formatCount(item.count)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
