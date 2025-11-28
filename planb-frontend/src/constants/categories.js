// Catégories et sous-catégories de Plan B

export const CATEGORIES = {
  IMMOBILIER: {
    id: 'immobilier',
    name: 'Immobilier',
    icon: 'Home',
    color: 'from-blue-400 to-blue-600',
    subcategories: [
      { id: 'appartement', name: 'Appartement', icon: 'Building2' },
      { id: 'villa', name: 'Villa', icon: 'Home' },
      { id: 'studio', name: 'Studio', icon: 'DoorClosed' },
      { id: 'terrain', name: 'Terrain', icon: 'Trees' },
      { id: 'magasin', name: 'Magasin', icon: 'Store' },
    ]
  },
  VEHICULE: {
    id: 'vehicule',
    name: 'Véhicule',
    icon: 'Car',
    color: 'from-red-400 to-red-600',
    subcategories: [
      { id: 'voiture', name: 'Voiture', icon: 'Car' },
      { id: 'moto', name: 'Moto', icon: 'Bike' },
    ]
  },
  VACANCE: {
    id: 'vacance',
    name: 'Vacance',
    icon: 'Palmtree',
    color: 'from-green-400 to-green-600',
    subcategories: [
      { id: 'appartement-meuble', name: 'Appartement meublé', icon: 'Building2' },
      { id: 'villa-meublee', name: 'Villa meublée', icon: 'Home' },
      { id: 'studio-meuble', name: 'Studio meublé', icon: 'DoorClosed' },
      { id: 'hotel', name: 'Hôtel', icon: 'Hotel' },
    ]
  }
};

// Types d'annonces
export const LISTING_TYPES = {
  VENTE: 'vente',
  LOCATION: 'location'
};

// Pays supportés
export const COUNTRIES = [
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: 'BJ', name: 'Bénin', flag: '🇧🇯' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱' }
];

// Filtres de prix (en FCFA)
export const PRICE_RANGES = [
  { id: 'all', label: 'Tous les prix', min: 0, max: Infinity },
  { id: 'low', label: '< 100 000 FCFA', min: 0, max: 100000 },
  { id: 'medium', label: '100K - 500K FCFA', min: 100000, max: 500000 },
  { id: 'high', label: '500K - 1M FCFA', min: 500000, max: 1000000 },
  { id: 'premium', label: '1M - 5M FCFA', min: 1000000, max: 5000000 },
  { id: 'luxury', label: '> 5M FCFA', min: 5000000, max: Infinity }
];

// États des biens immobiliers
export const PROPERTY_CONDITIONS = [
  { id: 'neuf', name: 'Neuf' },
  { id: 'tres-bon', name: 'Très bon état' },
  { id: 'bon', name: 'Bon état' },
  { id: 'a-renover', name: 'À rénover' }
];

// Types de carburant pour véhicules
export const FUEL_TYPES = [
  { id: 'essence', name: 'Essence' },
  { id: 'diesel', name: 'Diesel' },
  { id: 'hybride', name: 'Hybride' },
  { id: 'electrique', name: 'Électrique' }
];

// Transmission pour véhicules
export const TRANSMISSION_TYPES = [
  { id: 'manuelle', name: 'Manuelle' },
  { id: 'automatique', name: 'Automatique' }
];
