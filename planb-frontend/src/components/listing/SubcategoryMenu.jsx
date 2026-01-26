import { ChevronDown, Building2, Home, DoorClosed, Trees, Store, Car, Bike, Hotel, Palmtree } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../../constants/categories';

// Mapping des icônes Lucide
const IconComponents = {
  Building2,
  Home,
  DoorClosed,
  Trees,
  Store,
  Car,
  Bike,
  Hotel,
  Palmtree
};

/**
 * Menu déroulant des sous-catégories avec icônes Lucide
 */
export default function SubcategoryMenu({ activeCategory, activeSubcategory, onSubcategoryChange }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const category = Object.values(CATEGORIES).find(c => c.id === activeCategory);
  const subcategories = category?.subcategories || [];
  const selectedSubcategory = subcategories.find(s => s.id === activeSubcategory);

  // Fonction pour récupérer le composant d'icône
  const getIconComponent = (iconName) => {
    if (!iconName || typeof iconName !== 'string') {
      return Home;
    }
    const Component = IconComponents[iconName];
    return Component || Home;
  };

  if (!category || subcategories.length === 0) return null;

  return (
    <div className="relative">
      {/* Bouton du menu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white/80 rounded-xl border-2 border-secondary-200 flex items-center justify-between hover:border-primary-500 transition-all"
      >
        <div className="flex items-center gap-2">
          {(() => {
            const iconName = selectedSubcategory?.icon || category.icon;
            const IconComponent = getIconComponent(iconName);
            return <IconComponent size={20} className="text-primary-600" />;
          })()}
          <span className="font-medium text-secondary-900">
            {selectedSubcategory?.name || 'Toutes les sous-catégories'}
          </span>
        </div>
        <ChevronDown 
          size={20} 
          className={`text-secondary-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Menu déroulant */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Liste */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-secondary-200 overflow-hidden z-50"
            >
              {/* Option "Toutes" */}
              <button
                onClick={() => {
                  onSubcategoryChange('');
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors flex items-center gap-2
                  ${!activeSubcategory ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-secondary-700'}
                `}
              >
                {(() => {
                  const IconComponent = getIconComponent(category.icon);
                  return <IconComponent size={18} className={!activeSubcategory ? 'text-primary-600' : 'text-secondary-600'} />;
                })()}
                <span>Toutes les sous-catégories</span>
              </button>

              {/* Sous-catégories */}
              {subcategories.map((subcategory) => {
                const isActive = activeSubcategory === subcategory.id;
                const IconComponent = getIconComponent(subcategory.icon);
                
                return (
                  <button
                    key={subcategory.id}
                    onClick={() => {
                      onSubcategoryChange(subcategory.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors flex items-center gap-2 border-t border-secondary-100
                      ${isActive ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-secondary-700'}
                    `}
                  >
                    <IconComponent size={18} className={isActive ? 'text-primary-600' : 'text-secondary-600'} />
                    <span>{subcategory.name}</span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
