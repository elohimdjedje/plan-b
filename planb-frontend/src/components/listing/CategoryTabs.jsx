import { Home, Car, Palmtree } from 'lucide-react';
import { CATEGORIES } from '../../constants/categories';

// Mapping des icônes Lucide
const IconComponents = {
  Home,
  Car,
  Palmtree,
};

/**
 * Onglets de catégories avec icônes circulaires (style Le Bon Coin)
 */
export default function CategoryTabs({ activeCategory, onCategoryChange }) {
  const categories = Object.values(CATEGORIES);

  // Fonction pour récupérer le composant d'icône
  const getIconComponent = (iconName) => {
    if (!iconName || typeof iconName !== 'string') {
      return Home;
    }
    const Component = IconComponents[iconName];
    return Component || Home;
  };

  return (
    <div className="flex justify-around gap-2 md:gap-4 px-2 py-2 overflow-x-auto">
      {categories.map((category) => {
        const isActive = activeCategory === category.id;
        const Icon = getIconComponent(category.icon);
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className="flex flex-col items-center gap-1 md:gap-2 min-w-[65px] md:min-w-[80px] flex-shrink-0 p-1"
          >
            <div
              className={`
                w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center
                transition-all duration-200 border-2
                ${isActive 
                  ? 'bg-primary-500/10 border-primary-500 shadow-md scale-110' 
                  : 'bg-white/50 border-transparent hover:bg-white/80'
                }
              `}
            >
              <Icon 
                size={20}
                className={`md:w-7 md:h-7 ${isActive ? 'text-primary-600' : 'text-secondary-600'}`}
              />
            </div>
            <span 
              className={`
                text-xs md:text-sm font-medium transition-colors
                ${isActive ? 'text-primary-600' : 'text-secondary-700'}
              `}
            >
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
