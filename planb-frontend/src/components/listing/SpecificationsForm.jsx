import { 
  Home, Building, Car, Bed, Bath, Ruler, Calendar, Fuel, Settings, Zap, 
  Droplets, Wind, Sun, Tv, Wifi, ParkingCircle, Trees, Shield, MapPin,
  Bike, Truck, Package, Users, Gauge, Palette, Star, UtensilsCrossed, Info
} from 'lucide-react';
import { getSpecificationsForCategory } from '../../config/specifications';

// Map des icônes
const ICONS = {
  Home, Building, Car, Bed, Bath, Ruler, Calendar, Fuel, Settings, Zap,
  Droplets, Wind, Sun, Tv, Wifi, ParkingCircle, Trees, Shield, MapPin,
  Bike, Truck, Package, Users, Gauge, Palette, Star, UtensilsCrossed
};

/**
 * Formulaire de saisie des spécifications d'une annonce
 */
export default function SpecificationsForm({ 
  category, 
  subcategory, 
  specifications = {}, 
  onChange 
}) {
  const specConfig = getSpecificationsForCategory(category, subcategory);
  
  if (!specConfig || specConfig.length === 0) {
    return null;
  }
  
  const handleChange = (key, value) => {
    onChange({
      ...specifications,
      [key]: value
    });
  };
  
  // Séparer les champs texte/nombre/select des booléens
  const mainFields = specConfig.filter(s => s.type !== 'boolean');
  const booleanFields = specConfig.filter(s => s.type === 'boolean');
  
  return (
    <div className="space-y-6">
      {/* Titre de section */}
      <div className="flex items-center gap-2 text-secondary-700">
        <Info size={20} />
        <h3 className="font-semibold">Informations clés</h3>
        <span className="text-xs text-secondary-400">(optionnel mais recommandé)</span>
      </div>
      
      {/* Champs principaux */}
      {mainFields.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {mainFields.map((spec) => {
            const IconComponent = ICONS[spec.icon] || Home;
            const value = specifications[spec.key] || '';
            
            return (
              <div key={spec.key} className="space-y-1">
                <label className="flex items-center gap-1.5 text-sm font-medium text-secondary-700">
                  <IconComponent size={14} className="text-secondary-400" />
                  {spec.label}
                  {spec.unit && <span className="text-xs text-secondary-400">({spec.unit})</span>}
                </label>
                
                {spec.type === 'select' ? (
                  <select
                    value={value}
                    onChange={(e) => handleChange(spec.key, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner...</option>
                    {spec.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : spec.type === 'number' ? (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleChange(spec.key, e.target.value ? Number(e.target.value) : '')}
                    placeholder={spec.unit ? `Ex: 100` : '0'}
                    min="0"
                    className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(spec.key, e.target.value)}
                    placeholder={`Ex: ${spec.label}`}
                    className="w-full px-3 py-2 bg-white border border-secondary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Équipements (booléens) */}
      {booleanFields.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-secondary-700">Équipements & Caractéristiques</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {booleanFields.map((spec) => {
              const IconComponent = ICONS[spec.icon] || Home;
              const isChecked = specifications[spec.key] || false;
              
              return (
                <label
                  key={spec.key}
                  className={`
                    flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all
                    ${isChecked 
                      ? 'bg-primary-50 border-primary-300 text-primary-700' 
                      : 'bg-white border-secondary-200 text-secondary-600 hover:border-secondary-300'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleChange(spec.key, e.target.checked)}
                    className="hidden"
                  />
                  <IconComponent size={16} className={isChecked ? 'text-primary-600' : 'text-secondary-400'} />
                  <span className="text-sm truncate">{spec.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
