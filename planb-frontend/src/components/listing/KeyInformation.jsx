import { useState } from 'react';
import { 
  Home, Building, Car, Bed, Bath, Ruler, Calendar, Fuel, Settings, Zap, 
  Droplets, Wind, Sun, Tv, Wifi, ParkingCircle, Trees, Shield, MapPin,
  ChevronDown, ChevronUp, Bike, Truck, Package, Users, Gauge, Palette, Star,
  UtensilsCrossed
} from 'lucide-react';
import { getSpecificationsForCategory, formatSpecValue } from '../../config/specifications';

// Map des icônes
const ICONS = {
  Home, Building, Car, Bed, Bath, Ruler, Calendar, Fuel, Settings, Zap,
  Droplets, Wind, Sun, Tv, Wifi, ParkingCircle, Trees, Shield, MapPin,
  Bike, Truck, Package, Users, Gauge, Palette, Star, UtensilsCrossed
};

/**
 * Affiche les informations clés d'une annonce style Leboncoin
 */
export default function KeyInformation({ listing }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!listing) return null;
  
  // Récupérer les specs de l'annonce
  const specs = listing.specifications || {};
  const specConfig = getSpecificationsForCategory(listing.category, listing.subcategory);
  
  // Filtrer les specs qui ont une valeur
  const filledSpecs = specConfig.filter(spec => {
    const value = specs[spec.key];
    return value !== null && value !== undefined && value !== '' && value !== false;
  });
  
  if (filledSpecs.length === 0) return null;
  
  // Limiter à 6 éléments si non étendu
  const visibleSpecs = expanded ? filledSpecs : filledSpecs.slice(0, 6);
  const hasMore = filledSpecs.length > 6;
  
  return (
    <div className="bg-white rounded-xl p-4 md:p-5 border border-secondary-100">
      <h3 className="text-lg font-bold text-secondary-900 mb-4">
        Les informations clés
      </h3>
      
      {/* Grille des informations */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {visibleSpecs.map((spec) => {
          const IconComponent = ICONS[spec.icon] || Home;
          const value = specs[spec.key];
          const displayValue = formatSpecValue(spec, value);
          
          return (
            <div key={spec.key} className="flex items-start gap-3">
              {/* Icône */}
              <div className="flex-shrink-0 mt-0.5">
                <IconComponent size={18} className="text-secondary-400" />
              </div>
              
              {/* Label et valeur */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-secondary-500 leading-tight">
                  {spec.label}
                </p>
                <p className="text-sm font-semibold text-secondary-900 truncate">
                  {displayValue}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Bouton voir plus/moins */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
        >
          {expanded ? (
            <>
              Voir moins
              <ChevronUp size={16} />
            </>
          ) : (
            <>
              Voir plus ({filledSpecs.length - 6} autres)
              <ChevronDown size={16} />
            </>
          )}
        </button>
      )}
    </div>
  );
}
