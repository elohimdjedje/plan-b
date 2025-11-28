import { useState } from 'react';
import { HelpCircle, ChevronRight, ChevronDown, Home, Car, Palmtree, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mapping des icônes Lucide
const IconComponents = {
  Home,
  Car,
  Palmtree,
  Search
};

/**
 * Section "D'après vos dernières recherches" (Menu déroulant)
 * Permet de cliquer sur une recherche pour appliquer les filtres correspondants
 */
export default function RecentSearches({ 
  title = "D'après vos dernières recherches", 
  searches = [],
  onSearchClick 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchClick = (search) => {
    if (onSearchClick) {
      onSearchClick(search);
    }
    setIsOpen(false); // Ferme le menu après sélection
  };

  // Fonction pour récupérer le composant d'icône
  const getIconComponent = (iconName) => {
    // Vérifier que iconName est une string valide
    if (!iconName || typeof iconName !== 'string') {
      return Search;
    }
    // Retourner le composant ou Search par défaut
    const Component = IconComponents[iconName];
    return Component || Search;
  };

  if (!searches || searches.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Titre avec icône aide */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-secondary-900">{title}</h2>
        <button className="p-2 hover:bg-secondary-100 rounded-full transition-colors">
          <HelpCircle size={20} className="text-secondary-600" />
        </button>
      </div>

      {/* Bouton menu déroulant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-secondary-200 hover:border-secondary-300 transition-all shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
            {(() => {
              const IconComponent = getIconComponent(searches[0]?.icon);
              return <IconComponent size={20} className="text-primary-600" />;
            })()}
          </div>
          <span className="font-medium text-secondary-900">
            {isOpen ? 'Sélectionnez une recherche' : searches[0]?.label}
          </span>
        </div>
        <ChevronDown 
          size={20} 
          className={`text-secondary-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Menu déroulant */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 overflow-hidden"
          >
            <div className="bg-white rounded-xl border border-secondary-200 shadow-lg">
              {searches.map((search, index) => {
                const IconComponent = getIconComponent(search.icon);
                return (
                  <button
                    key={index}
                    onClick={() => handleSearchClick(search)}
                    className={`
                      w-full flex items-center justify-between p-4 
                      hover:bg-secondary-50 transition-colors
                      ${index !== searches.length - 1 ? 'border-b border-secondary-100' : ''}
                      ${index === 0 ? 'rounded-t-xl' : ''}
                      ${index === searches.length - 1 ? 'rounded-b-xl' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                        <IconComponent size={20} className="text-primary-600" />
                      </div>
                      <span className="font-medium text-secondary-900">{search.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-secondary-400" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
