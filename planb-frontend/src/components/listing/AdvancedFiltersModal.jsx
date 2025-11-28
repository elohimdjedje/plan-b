import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import { CATEGORIES, COUNTRIES } from '../../constants/categories';
import { CITIES_LIST, getCommunes } from '../../constants/locations';

/**
 * Modal de filtres avancés (style Le Bon Coin)
 */
export default function AdvancedFiltersModal({ isOpen, onClose, onApply, currentFilters = {}, activeCategory = 'immobilier' }) {
  const [filters, setFilters] = useState({
    type: currentFilters.type || '',
    subcategory: currentFilters.subcategory || '',
    country: currentFilters.country || '',
    city: currentFilters.city || '',
    commune: currentFilters.commune || '',
    quartier: currentFilters.quartier || '',
    // Immobilier
    propertyType: currentFilters.propertyType || '',
    roomsConfig: currentFilters.roomsConfig || '',
    roomsMin: currentFilters.roomsMin || '',
    roomsMax: currentFilters.roomsMax || '',
    bedroomsMin: currentFilters.bedroomsMin || '',
    bedroomsMax: currentFilters.bedroomsMax || '',
    surfaceMin: currentFilters.surfaceMin || '',
    surfaceMax: currentFilters.surfaceMax || '',
    landSurfaceMin: currentFilters.landSurfaceMin || '',
    landSurfaceMax: currentFilters.landSurfaceMax || '',
    // Véhicules
    vehicleType: currentFilters.vehicleType || '',
    brand: currentFilters.brand || '',
    model: currentFilters.model || '',
    yearMin: currentFilters.yearMin || '',
    yearMax: currentFilters.yearMax || '',
    mileageMin: currentFilters.mileageMin || '',
    mileageMax: currentFilters.mileageMax || '',
    fuelType: currentFilters.fuelType || '',
    transmission: currentFilters.transmission || '',
    // Vacances
    accommodationType: currentFilters.accommodationType || '',
    guests: currentFilters.guests || [],
    checkIn: currentFilters.checkIn || '',
    checkOut: currentFilters.checkOut || '',
    // Commun
    priceMin: currentFilters.priceMin || '',
    priceMax: currentFilters.priceMax || '',
  });

  // Données dynamiques selon la catégorie
  const immobilierTypes = [
    { id: 'appartement', label: 'Appartement' },
    { id: 'maison', label: 'Maison' },
    { id: 'villa', label: 'Villa' },
    { id: 'terrain', label: 'Terrain' },
    { id: 'magasin', label: 'Magasin' },
  ];

  const vehiculeTypes = [
    { id: 'voiture', label: 'Voiture' },
    { id: 'moto', label: 'Moto' },
    { id: 'camion', label: 'Camion' },
    { id: 'bus', label: 'Bus' },
  ];

  const vacanceTypes = [
    { id: 'hotel', label: 'Hôtel' },
    { id: 'appartement', label: 'Appartement' },
    { id: 'villa', label: 'Villa' },
    { id: 'chambre', label: 'Chambre d\'hôte' },
  ];

  const fuelTypes = [
    { id: 'essence', label: 'Essence' },
    { id: 'diesel', label: 'Diesel' },
    { id: 'electrique', label: 'Électrique' },
    { id: 'hybride', label: 'Hybride' },
  ];

  const transmissionTypes = [
    { id: 'manuelle', label: 'Manuelle' },
    { id: 'automatique', label: 'Automatique' },
  ];

  const roomNumbers = [1, 2, 3, 4, 5, 6, 7, '8+'];
  const guestNumbers = [1, 2, 3, 4, 5, 6, '7+'];

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const togglePropertyType = (typeId) => {
    const current = filters.propertyTypes || [];
    const newTypes = current.includes(typeId)
      ? current.filter(t => t !== typeId)
      : [...current, typeId];
    handleChange('propertyTypes', newTypes);
  };

  const toggleArrayValue = (field, value) => {
    const current = filters[field] || [];
    const newValues = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleChange(field, newValues);
  };

  const handleReset = () => {
    setFilters({
      type: '',
      subcategory: '',
      country: '',
      city: '',
      commune: '',
      quartier: '',
      propertyType: '',
      roomsConfig: '',
      roomsMin: '',
      roomsMax: '',
      bedroomsMin: '',
      bedroomsMax: '',
      surfaceMin: '',
      surfaceMax: '',
      landSurfaceMin: '',
      landSurfaceMax: '',
      vehicleType: '',
      brand: '',
      model: '',
      yearMin: '',
      yearMax: '',
      mileageMin: '',
      mileageMax: '',
      fuelType: '',
      transmission: '',
      accommodationType: '',
      guests: [],
      checkIn: '',
      checkOut: '',
      priceMin: '',
      priceMax: '',
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const countActiveFilters = () => {
    let count = 0;
    // Type
    if (filters.type) count++;
    // Prix
    if (filters.priceMin || filters.priceMax) count++;
    // Localisation
    if (filters.country) count++;
    if (filters.city) count++;
    // Immobilier
    if (filters.propertyType) count++;
    if (filters.roomsConfig) count++;
    if (filters.surfaceMin || filters.surfaceMax) count++;
    if (filters.landSurfaceMin || filters.landSurfaceMax) count++;
    // Véhicules
    if (filters.vehicleType) count++;
    if (filters.brand) count++;
    if (filters.yearMin || filters.yearMax) count++;
    if (filters.mileageMin || filters.mileageMax) count++;
    if (filters.fuelType) count++;
    if (filters.transmission) count++;
    // Vacances
    if (filters.accommodationType) count++;
    if (filters.guests?.length > 0) count++;
    if (filters.checkIn) count++;
    if (filters.checkOut) count++;
    return count;
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ 
            x: '100%',
            opacity: 0,
            scaleX: 0.8,
            rotateY: 45,
            transformOrigin: 'right center'
          }}
          animate={{ 
            x: 0,
            opacity: 1,
            scaleX: 1,
            rotateY: 0,
            transformOrigin: 'right center'
          }}
          exit={{ 
            x: '100%',
            opacity: 0,
            scaleX: 0.3,
            scaleY: 0.8,
            rotateY: 90,
            skewY: -10,
            transformOrigin: 'right center'
          }}
          transition={{ 
            duration: 0.6,
            ease: [0.32, 0.72, 0, 1],
            opacity: { duration: 0.3 }
          }}
          onClick={(e) => e.stopPropagation()}
          style={{ 
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            perspective: '1000px'
          }}
          className="absolute top-0 right-0 bottom-0 w-full md:w-[480px] lg:w-[520px] bg-white shadow-2xl md:border-l border-secondary-200 rounded-tl-2xl rounded-tr-2xl md:rounded-none"
        >
          {/* Header avec boutons d'action */}
          <div className="flex-shrink-0 bg-white/95 backdrop-blur-xl border-b border-white/30 px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between gap-2 z-10 sticky top-0">
            <h2 className="text-sm md:text-base font-bold text-secondary-900 flex-shrink-0">🔍 Filtres</h2>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Bouton Réinitialiser compact */}
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs md:text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:bg-white/60 backdrop-blur-sm rounded-lg transition-all flex items-center gap-1 border border-secondary-300/50"
              >
                <span className="hidden md:inline">🔄</span>
                <span>Réinit.</span>
              </button>
              
              {/* Bouton Rechercher compact */}
              <button
                onClick={handleApply}
                className="px-3 py-1.5 text-xs md:text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-all flex items-center gap-1 shadow-md"
              >
                <span>🔍</span>
                <span className="hidden md:inline">Rechercher</span>
                {countActiveFilters() > 0 && (
                  <span className="text-xs font-bold">({countActiveFilters()})</span>
                )}
              </button>
              
              {/* Bouton Fermer */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/60 backdrop-blur-sm rounded-full transition-colors flex-shrink-0"
              >
                <X size={20} className="text-secondary-600" />
              </button>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto px-3 md:px-4 py-3 pb-6 space-y-3 md:space-y-4 overscroll-contain">
            {/* Type d'annonce */}
            <div>
              <h3 className="text-base font-semibold text-secondary-900 mb-2">Type d'annonce</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleChange('type', 'vente')}
                  className={`p-2.5 rounded-lg text-sm font-medium transition-all ${
                    filters.type === 'vente'
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-secondary-50 text-secondary-900 hover:bg-secondary-100'
                  }`}
                >
                  Vente
                </button>
                <button
                  onClick={() => handleChange('type', 'location')}
                  className={`p-2.5 rounded-lg text-sm font-medium transition-all ${
                    filters.type === 'location'
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-secondary-50 text-secondary-900 hover:bg-secondary-100'
                  }`}
                >
                  Location
                </button>
              </div>
            </div>

            {/* Localisation */}
            <div>
              <h3 className="text-base font-semibold text-secondary-900 mb-2">Localisation</h3>
              <div className="space-y-2">
                <select
                  value={filters.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Tous les pays</option>
                  {COUNTRIES.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
                {filters.country && filters.country === 'CI' && (
                  <>
                    <select
                      value={filters.city}
                      onChange={(e) => {
                        handleChange('city', e.target.value);
                        handleChange('commune', '');
                        handleChange('quartier', '');
                      }}
                      className="w-full px-3 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">Toutes les villes</option>
                      {CITIES_LIST.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    
                    {filters.city && (
                      <select
                        value={filters.commune}
                        onChange={(e) => {
                          handleChange('commune', e.target.value);
                          handleChange('quartier', '');
                        }}
                        className="w-full px-3 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      >
                        <option value="">Toutes les communes</option>
                        {getCommunes(filters.city).map(commune => (
                          <option key={commune} value={commune}>{commune}</option>
                        ))}
                      </select>
                    )}
                    
                    {filters.city && filters.commune && (
                      <input
                        type="text"
                        value={filters.quartier}
                        onChange={(e) => handleChange('quartier', e.target.value)}
                        placeholder="Quartier (facultatif)"
                        className="w-full px-3 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none placeholder-secondary-400"
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Prix */}
            <div>
              <h3 className="text-base font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                <DollarSign size={20} className="text-primary-500" />
                {filters.type === 'location' ? 'Loyer' : 'Prix'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-600 mb-1.5">Minimum</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder=""
                      value={filters.priceMin}
                      onChange={(e) => handleChange('priceMin', e.target.value)}
                      className="w-full px-3 py-2.5 pr-14 text-sm bg-white border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 text-sm font-medium">€</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary-600 mb-1.5">Maximum</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder=""
                      value={filters.priceMax}
                      onChange={(e) => handleChange('priceMax', e.target.value)}
                      className="w-full px-3 py-2.5 pr-14 text-sm bg-white border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 text-sm font-medium">€</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FILTRES IMMOBILIER */}
            {activeCategory === 'immobilier' && (
              <>
                {/* Type de bien */}
                <div>
                  <h3 className="text-base font-semibold text-secondary-900 mb-2">Type de bien</h3>
                  <select
                    value={filters.propertyType || ''}
                    onChange={(e) => handleChange('propertyType', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">Tous les types</option>
                    {immobilierTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pièces et Chambres - Menu unique */}
                <div>
                  <h3 className="text-base font-semibold text-secondary-900 mb-2">Pièces et chambres</h3>
                  <select
                    value={filters.roomsConfig || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        const [rooms, bedrooms] = value.split('-');
                        handleChange('roomsMin', rooms);
                        handleChange('bedroomsMin', bedrooms);
                      } else {
                        handleChange('roomsMin', '');
                        handleChange('bedroomsMin', '');
                      }
                      handleChange('roomsConfig', value);
                    }}
                    className="w-full px-3 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">Toutes configurations</option>
                    <option value="1-0">Studio (1 pièce)</option>
                    <option value="2-1">2 pièces, 1 chambre</option>
                    <option value="3-1">3 pièces, 1 chambre</option>
                    <option value="3-2">3 pièces, 2 chambres</option>
                    <option value="4-2">4 pièces, 2 chambres</option>
                    <option value="4-3">4 pièces, 3 chambres</option>
                    <option value="5-3">5 pièces, 3 chambres</option>
                    <option value="5-4">5 pièces, 4 chambres</option>
                    <option value="6-4">6 pièces, 4 chambres</option>
                    <option value="6-5">6+ pièces, 5+ chambres</option>
                  </select>
                </div>

                {/* Surface habitable */}
                <div>
                  <h3 className="text-base font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">📐</span>
                    Surface habitable
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-secondary-600 mb-1.5">Minimum</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder=""
                          value={filters.surfaceMin}
                          onChange={(e) => handleChange('surfaceMin', e.target.value)}
                          className="w-full px-3 py-2.5 pr-14 text-sm bg-white border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 text-sm font-medium">m²</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-secondary-600 mb-1.5">Maximum</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder=""
                          value={filters.surfaceMax}
                          onChange={(e) => handleChange('surfaceMax', e.target.value)}
                          className="w-full px-3 py-2.5 pr-14 text-sm bg-white border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 text-sm font-medium">m²</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Surface du terrain */}
                <div>
                  <h3 className="text-base font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">🌳</span>
                    Surface du terrain
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-secondary-600 mb-1.5">Minimum</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder=""
                          value={filters.landSurfaceMin}
                          onChange={(e) => handleChange('landSurfaceMin', e.target.value)}
                          className="w-full px-3 py-2.5 pr-14 text-sm bg-white border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 text-sm font-medium">m²</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-secondary-600 mb-1.5">Maximum</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder=""
                          value={filters.landSurfaceMax}
                          onChange={(e) => handleChange('landSurfaceMax', e.target.value)}
                          className="w-full px-3 py-2.5 pr-14 text-sm bg-white border border-secondary-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 text-sm font-medium">m²</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* FILTRES VÉHICULES */}
            {activeCategory === 'vehicule' && (
              <>
                {/* Type de véhicule */}
                <div>
                  <h3 className="text-base font-semibold text-secondary-900 mb-2">Type de véhicule</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {vehiculeTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => handleChange('vehicleType', filters.vehicleType === type.id ? '' : type.id)}
                        className={`p-4 rounded-xl font-medium transition-all ${
                          filters.vehicleType === type.id
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'bg-secondary-50 text-secondary-900 hover:bg-secondary-100'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Marque et Modèle */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-secondary-900 mb-2">Marque</label>
                    <input
                      type="text"
                      placeholder="Ex: Toyota"
                      value={filters.brand}
                      onChange={(e) => handleChange('brand', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-900 mb-2">Modèle</label>
                    <input
                      type="text"
                      placeholder="Ex: Corolla"
                      value={filters.model}
                      onChange={(e) => handleChange('model', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Année */}
                <div>
                  <h3 className="text-base font-semibold text-secondary-900 mb-2">Année</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Année min"
                      value={filters.yearMin}
                      onChange={(e) => handleChange('yearMin', e.target.value)}
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-3 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Année max"
                      value={filters.yearMax}
                      onChange={(e) => handleChange('yearMax', e.target.value)}
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-3 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Kilométrage */}
                <div>
                  <h3 className="text-base font-semibold text-secondary-900 mb-2">Kilométrage</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Km min"
                        value={filters.mileageMin}
                        onChange={(e) => handleChange('mileageMin', e.target.value)}
                        className="w-full px-4 py-3 pr-12 bg-secondary-50 border-2 border-secondary-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-500 text-xs">km</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Km max"
                        value={filters.mileageMax}
                        onChange={(e) => handleChange('mileageMax', e.target.value)}
                        className="w-full px-4 py-3 pr-12 bg-secondary-50 border-2 border-secondary-200 rounded-xl focus:border-primary-500 focus:outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-500 text-xs">km</span>
                    </div>
                  </div>
                </div>

                {/* Carburant */}
                <div>
                  <h3 className="text-base font-semibold text-secondary-900 mb-2">Carburant</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {fuelTypes.map((fuel) => (
                      <button
                        key={fuel.id}
                        onClick={() => handleChange('fuelType', filters.fuelType === fuel.id ? '' : fuel.id)}
                        className={`p-3 rounded-xl font-medium transition-all ${
                          filters.fuelType === fuel.id
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'bg-secondary-50 text-secondary-900 hover:bg-secondary-100'
                        }`}
                      >
                        {fuel.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transmission */}
                <div>
                  <h3 className="text-base font-semibold text-secondary-900 mb-2">Boîte de vitesse</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {transmissionTypes.map((trans) => (
                      <button
                        key={trans.id}
                        onClick={() => handleChange('transmission', filters.transmission === trans.id ? '' : trans.id)}
                        className={`p-3 rounded-xl font-medium transition-all ${
                          filters.transmission === trans.id
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'bg-secondary-50 text-secondary-900 hover:bg-secondary-100'
                        }`}
                      >
                        {trans.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* FILTRES VACANCES */}
            {activeCategory === 'vacance' && (
              <>
                {/* Type d'hébergement */}
                <div>
                  <h3 className="text-base font-semibold text-secondary-900 mb-2">Type d'hébergement</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {vacanceTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => handleChange('accommodationType', filters.accommodationType === type.id ? '' : type.id)}
                        className={`p-4 rounded-xl font-medium transition-all ${
                          filters.accommodationType === type.id
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'bg-secondary-50 text-secondary-900 hover:bg-secondary-100'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nombre de voyageurs */}
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">Nombre de voyageurs</h3>
                  <p className="text-sm text-secondary-600 mb-3">Sélectionnez le nombre de personnes</p>
                  <div className="grid grid-cols-4 gap-2">
                    {guestNumbers.map((num) => (
                      <button
                        key={num}
                        onClick={() => toggleArrayValue('guests', num)}
                        className={`p-4 rounded-xl font-semibold transition-all ${
                          filters.guests?.includes(num)
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'bg-secondary-50 text-secondary-900 hover:bg-secondary-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="text-base font-semibold text-secondary-900 mb-2">Dates</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-secondary-600 mb-2">Arrivée</label>
                      <input
                        type="date"
                        value={filters.checkIn}
                        onChange={(e) => handleChange('checkIn', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-600 mb-2">Départ</label>
                      <input
                        type="date"
                        value={filters.checkOut}
                        onChange={(e) => handleChange('checkOut', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer minimal pour espace de sécurité */}
          <div className="flex-shrink-0 h-4 bg-gradient-to-t from-white/50 to-transparent"></div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
