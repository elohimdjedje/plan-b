import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import AdvancedFiltersModal from './AdvancedFiltersModal';
import SearchModal from '../search/SearchModal';

/**
 * Barre de filtres avec modal avancé (style Le Bon Coin)
 * Devient sticky à sa position initiale lors du scroll avec transition fluide
 */
export default function FilterBar({ onFilter, currentFilters = {}, activeCategory = 'immobilier', scrollY = 0, onSearch }) {
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const barRef = useRef(null);
  const [initialTop, setInitialTop] = useState(0);

  // Récupérer la position initiale de la barre au montage
  useEffect(() => {
    if (barRef.current) {
      const rect = barRef.current.getBoundingClientRect();
      // Position par rapport au document (pas à la fenêtre)
      setInitialTop(rect.top + window.scrollY);
    }
  }, []);

  // La barre devient sticky quand on scroll au-delà de sa position initiale
  // Utiliser une position fixe calculée
  const stickyThreshold = Math.max(initialTop - 16, 180); // -16px pour un léger décalage
  const isSticky = scrollY > stickyThreshold;

  // Calculer la progression du scroll pour les transitions fluides (de 0 à 1)
  const transitionRange = 100; // pixels sur lesquels la transition s'effectue
  const scrollProgress = isSticky
    ? Math.min((scrollY - stickyThreshold) / transitionRange, 1)
    : 0;

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

  // Styles dynamiques pour une transition progressive
  const dynamicStyles = isSticky ? {
    position: 'fixed',
    top: '16px',
    left: '16px',
    right: '16px',
    maxWidth: `${680 - (scrollProgress * 80)}px`, // Réduction progressive de la largeur
    margin: '0 auto',
    transform: `scale(${1 - (scrollProgress * 0.03)})`, // Légère réduction de taille
    boxShadow: `0 ${4 + scrollProgress * 8}px ${12 + scrollProgress * 12}px rgba(0, 0, 0, ${0.08 + scrollProgress * 0.07})`,
  } : {};

  return (
    <>
      {/* Espace réservé quand la barre est fixe (évite le saut de contenu) */}
      {isSticky && <div className="h-[72px] mb-4 mt-4" />}

      <div
        ref={barRef}
        className={`
          z-40 p-3 border rounded-2xl
          transition-all duration-500 ease-out
          ${isSticky
            ? 'bg-white/95 backdrop-blur-xl border-blue-200/50'
            : 'relative mb-4 mt-4 bg-white/40 backdrop-blur-md border-sky-200/30 shadow-sm'
          }
        `}
        style={dynamicStyles}
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
