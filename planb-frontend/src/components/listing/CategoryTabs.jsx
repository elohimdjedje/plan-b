import { Home, Car, Palmtree } from 'lucide-react';
import { CATEGORIES } from '../../constants/categories';

// Mapping des icônes Lucide
const IconComponents = {
  Home,
  Car,
  Palmtree,
};

/**
 * Onglets de catégories style pills horizontal
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
    <div className="flex items-center gap-2 px-2 py-2 overflow-x-auto scrollbar-hide">
      {categories.map((category) => {
        const isActive = activeCategory === category.id;
        const Icon = getIconComponent(category.icon);
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(isActive ? 'all' : category.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap 
              transition-all text-sm font-medium border
              ${isActive 
                ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }
            `}
          >
            <Icon size={16} />
            <span>{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}
