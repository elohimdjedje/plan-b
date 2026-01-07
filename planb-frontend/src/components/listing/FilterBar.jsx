import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import AdvancedFiltersModal from './AdvancedFiltersModal';
import SearchModal from '../search/SearchModal';

/**
 * Barre de filtres avec modal avancé (style Le Bon Coin)
 * Comportement simple type Le Bon Coin :
 * la barre reste dans le hero, puis se colle en haut de l'écran au scroll.
 */
export default function FilterBar({ onFilter, currentFilters = {}, activeCategory = 'immobilier', scrollY = 0, onSearch }) {
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const handleApplyFilters = (advancedFilters) => {
    onFilter({ ...currentFilters, ...advancedFilters });

    // Scroller automatiquement vers la section des annonces après application des filtres
    setTimeout(() => {
      const resultsSection = document.querySelector('[data-results]') ||
        document.querySelector('.grid.grid-cols-2');
      if (resultsSection) {
        const offset = 100;
        const elementPosition = resultsSection.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 300);
  };

  const activeFiltersCount = Object.values(currentFilters).filter(v => {
    if (Array.isArray(v)) return v.length > 0;
    return v && v !== '' && v !== 'all';
  }).length;

  return (
    <>
      <div
        className={`
          sticky top-4 z-40 p-3 border rounded-2xl
          bg-white/95 backdrop-blur-xl border-blue-200/50 shadow-md
          mb-4 mt-4
        `}
      >
        {/* Barre de recherche avec logo */}
        <div className="flex gap-2">
          {/* Bouton de recherche (ouvre la modal) */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex-1 flex items-center gap-3 bg-white/60 hover:bg-white/80 px-4 py-3 rounded-xl transition-all text-left backdrop-blur-sm border border-sky-100/50"
          >
            <Search size={18} className="text-blue-500" />
            <span className="text-slate-500">Rechercher une annonce...</span>
          </button>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowAdvancedModal(true)}
            className="p-3 rounded-xl transition-all relative bg-white/60 text-slate-600 hover:bg-white/80 backdrop-blur-sm border border-sky-100/50"
          >
            <SlidersHorizontal size={20} />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Modal de recherche */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={onSearch}
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
