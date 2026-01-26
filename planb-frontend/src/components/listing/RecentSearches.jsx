import { useState } from 'react';
import { X, MapPin, Home, Car, Palmtree, Search } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Section "Recherches récentes" style Leboncoin
 * Cartes horizontales avec titre, catégorie, localisation et bouton X
 */
export default function RecentSearches({ 
  title = "Recherches récentes", 
  searches = [],
  onSearchClick,
  onRemoveSearch
}) {
  const [localSearches, setLocalSearches] = useState(searches);

  // Supprimer une recherche
  const handleRemove = (e, index) => {
    e.stopPropagation();
    const updated = localSearches.filter((_, i) => i !== index);
    setLocalSearches(updated);
    localStorage.setItem('planb_recent_searches', JSON.stringify(updated));
    if (onRemoveSearch) onRemoveSearch(index);
  };

  // Mapper catégorie vers label
  const getCategoryLabel = (category) => {
    const labels = {
      'immobilier': 'Immobilier',
      'vehicule': 'Véhicules',
      'vacance': 'Vacances',
      'all': 'Toutes catégories'
    };
    return labels[category] || 'Recherche';
  };

  // Mapper type vers label
  const getTypeLabel = (type) => {
    if (type === 'location') return 'Locations';
    if (type === 'vente') return 'Ventes';
    return '';
  };

  if (!localSearches || localSearches.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Titre */}
      <h2 className="text-lg font-bold text-secondary-900 mb-4">{title}</h2>

      {/* Grille de cartes - scroll horizontal sur mobile */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {localSearches.map((search, index) => {
          const filters = search.filters || {};
          const category = getCategoryLabel(filters.category);
          const type = getTypeLabel(filters.type);
          const city = filters.city || '';
          
          // Construire le sous-titre
          const subtitle = [type, category].filter(Boolean).join(' - ');
          const location = city ? `${city}` : '';
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSearchClick && onSearchClick(search)}
              className="flex-shrink-0 min-w-[200px] max-w-[280px] bg-white rounded-xl border border-secondary-200 p-4 cursor-pointer hover:border-primary-300 hover:shadow-md transition-all group relative"
            >
              {/* Bouton X */}
              <button
                onClick={(e) => handleRemove(e, index)}
                className="absolute top-2 right-2 p-1.5 hover:bg-secondary-100 rounded-full opacity-60 hover:opacity-100 transition-all"
              >
                <X size={16} className="text-secondary-500" />
              </button>

              {/* Titre de la recherche */}
              <h3 className="font-semibold text-secondary-900 pr-6 line-clamp-1 group-hover:text-primary-600 transition-colors">
                {search.label || 'Recherche'}
              </h3>

              {/* Sous-titre (catégorie - type) */}
              {subtitle && (
                <p className="text-sm text-primary-600 mt-1">
                  {subtitle}
                </p>
              )}

              {/* Localisation */}
              {location && (
                <div className="flex items-center gap-1 mt-2 text-secondary-500">
                  <MapPin size={14} />
                  <span className="text-sm">{location}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
