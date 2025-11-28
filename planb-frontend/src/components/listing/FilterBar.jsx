import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import GlassCard from '../common/GlassCard';
import AdvancedFiltersModal from './AdvancedFiltersModal';
import SearchModal from '../search/SearchModal';

/**
 * Barre de filtres avec modal avancé (style Le Bon Coin)
 */
export default function FilterBar({ onFilter, currentFilters = {}, activeCategory = 'immobilier' }) {
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const handleApplyFilters = (advancedFilters) => {
    onFilter({ ...currentFilters, ...advancedFilters });
  };

  const activeFiltersCount = Object.values(currentFilters).filter(v => {
    if (Array.isArray(v)) return v.length > 0;
    return v && v !== '' && v !== 'all';
  }).length;

  return (
    <>
      <GlassCard className="sticky top-20 z-30 mb-4 mt-4">
        {/* Barre de recherche avec logo */}
        <div className="flex gap-2">
          {/* Bouton de recherche (ouvre la modal) */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex-1 flex items-center gap-3 bg-white/80 hover:bg-white px-4 py-3 rounded-xl transition-all text-left"
          >
            <Search size={18} className="text-gray-400" />
            <span className="text-gray-500">Rechercher une annonce...</span>
          </button>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowAdvancedModal(true)}
            className="p-3 rounded-xl transition-all relative bg-white/80 text-secondary-600 hover:bg-white"
          >
            <SlidersHorizontal size={20} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </GlassCard>

      {/* Modal de recherche */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* Modal de filtres avancés */}
      <AdvancedFiltersModal
        isOpen={showAdvancedModal}
        onClose={() => setShowAdvancedModal(false)}
        onApply={handleApplyFilters}
        currentFilters={currentFilters}
        activeCategory={activeCategory}
      />
    </>
  );
}
