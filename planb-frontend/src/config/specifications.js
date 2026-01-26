/**
 * Configuration des spécifications par catégorie
 * Adapté au contexte africain/ivoirien
 */

// Icônes disponibles (lucide-react)
// Home, Building, Car, Bike, Bed, Bath, Ruler, Calendar, Fuel, Settings, Zap, Droplets, Wind, Sun, Tv, Wifi, ParkingCircle, Trees, Shield, MapPin

export const SPECIFICATIONS_CONFIG = {
  // ==================== IMMOBILIER ====================
  immobilier: {
    // Appartement
    appartement: [
      { key: 'propertyType', label: 'Type de bien', type: 'select', icon: 'Building', options: ['Appartement', 'Studio', 'Duplex', 'Penthouse'] },
      { key: 'surface', label: 'Surface habitable', type: 'number', unit: 'm²', icon: 'Ruler' },
      { key: 'rooms', label: 'Nombre de pièces', type: 'number', icon: 'Home' },
      { key: 'bedrooms', label: 'Chambres', type: 'number', icon: 'Bed' },
      { key: 'bathrooms', label: 'Salles de bain', type: 'number', icon: 'Bath' },
      { key: 'toilets', label: 'Toilettes', type: 'number', icon: 'Bath' },
      { key: 'floor', label: 'Étage', type: 'number', icon: 'Building' },
      { key: 'hasElevator', label: 'Ascenseur', type: 'boolean', icon: 'Building' },
      { key: 'hasAC', label: 'Climatisation', type: 'boolean', icon: 'Wind' },
      { key: 'hasWater', label: 'Eau courante', type: 'boolean', icon: 'Droplets' },
      { key: 'hasElectricity', label: 'Électricité', type: 'boolean', icon: 'Zap' },
      { key: 'hasParking', label: 'Parking', type: 'boolean', icon: 'ParkingCircle' },
      { key: 'hasBalcony', label: 'Balcon/Terrasse', type: 'boolean', icon: 'Sun' },
      { key: 'isFurnished', label: 'Meublé', type: 'boolean', icon: 'Tv' },
      { key: 'hasInternet', label: 'Internet/Wifi', type: 'boolean', icon: 'Wifi' },
      { key: 'hasSecurity', label: 'Gardien/Sécurité', type: 'boolean', icon: 'Shield' },
    ],
    // Villa (alias vers maison)
    villa: [
      { key: 'propertyType', label: 'Type de villa', type: 'select', icon: 'Home', options: ['Villa simple', 'Villa duplex', 'Villa avec piscine', 'Villa basse', 'Villa R+1'] },
      { key: 'surface', label: 'Surface habitable', type: 'number', unit: 'm²', icon: 'Ruler' },
      { key: 'landSurface', label: 'Surface terrain', type: 'number', unit: 'm²', icon: 'Trees' },
      { key: 'rooms', label: 'Nombre de pièces', type: 'number', icon: 'Home' },
      { key: 'bedrooms', label: 'Chambres', type: 'number', icon: 'Bed' },
      { key: 'bathrooms', label: 'Salles de bain', type: 'number', icon: 'Bath' },
      { key: 'toilets', label: 'Toilettes', type: 'number', icon: 'Bath' },
      { key: 'hasGarage', label: 'Garage', type: 'boolean', icon: 'ParkingCircle' },
      { key: 'hasGarden', label: 'Jardin/Cour', type: 'boolean', icon: 'Trees' },
      { key: 'hasPool', label: 'Piscine', type: 'boolean', icon: 'Droplets' },
      { key: 'hasAC', label: 'Climatisation', type: 'boolean', icon: 'Wind' },
      { key: 'hasWater', label: 'Eau courante', type: 'boolean', icon: 'Droplets' },
      { key: 'hasElectricity', label: 'Électricité', type: 'boolean', icon: 'Zap' },
      { key: 'isFurnished', label: 'Meublé', type: 'boolean', icon: 'Tv' },
      { key: 'hasSecurity', label: 'Gardien/Sécurité', type: 'boolean', icon: 'Shield' },
    ],
    // Studio
    studio: [
      { key: 'surface', label: 'Surface', type: 'number', unit: 'm²', icon: 'Ruler' },
      { key: 'floor', label: 'Étage', type: 'number', icon: 'Building' },
      { key: 'hasAC', label: 'Climatisation', type: 'boolean', icon: 'Wind' },
      { key: 'hasWater', label: 'Eau courante', type: 'boolean', icon: 'Droplets' },
      { key: 'hasElectricity', label: 'Électricité', type: 'boolean', icon: 'Zap' },
      { key: 'isFurnished', label: 'Meublé', type: 'boolean', icon: 'Tv' },
      { key: 'hasInternet', label: 'Internet/Wifi', type: 'boolean', icon: 'Wifi' },
      { key: 'hasParking', label: 'Parking', type: 'boolean', icon: 'ParkingCircle' },
      { key: 'hasSecurity', label: 'Gardien/Sécurité', type: 'boolean', icon: 'Shield' },
    ],
    // Maison
    maison: [
      { key: 'propertyType', label: 'Type de bien', type: 'select', icon: 'Home', options: ['Maison', 'Villa', 'Duplex', 'Résidence'] },
      { key: 'surface', label: 'Surface habitable', type: 'number', unit: 'm²', icon: 'Ruler' },
      { key: 'landSurface', label: 'Surface terrain', type: 'number', unit: 'm²', icon: 'Trees' },
      { key: 'rooms', label: 'Nombre de pièces', type: 'number', icon: 'Home' },
      { key: 'bedrooms', label: 'Chambres', type: 'number', icon: 'Bed' },
      { key: 'bathrooms', label: 'Salles de bain', type: 'number', icon: 'Bath' },
      { key: 'toilets', label: 'Toilettes', type: 'number', icon: 'Bath' },
      { key: 'hasGarage', label: 'Garage', type: 'boolean', icon: 'ParkingCircle' },
      { key: 'hasGarden', label: 'Jardin/Cour', type: 'boolean', icon: 'Trees' },
      { key: 'hasPool', label: 'Piscine', type: 'boolean', icon: 'Droplets' },
      { key: 'hasAC', label: 'Climatisation', type: 'boolean', icon: 'Wind' },
      { key: 'hasWater', label: 'Eau courante', type: 'boolean', icon: 'Droplets' },
      { key: 'hasElectricity', label: 'Électricité', type: 'boolean', icon: 'Zap' },
      { key: 'isFurnished', label: 'Meublé', type: 'boolean', icon: 'Tv' },
      { key: 'hasSecurity', label: 'Gardien/Sécurité', type: 'boolean', icon: 'Shield' },
    ],
    // Terrain
    terrain: [
      { key: 'landType', label: 'Type de terrain', type: 'select', icon: 'Trees', options: ['Terrain nu', 'Terrain viabilisé', 'Terrain constructible', 'Terrain agricole'] },
      { key: 'surface', label: 'Superficie', type: 'number', unit: 'm²', icon: 'Ruler' },
      { key: 'hasWater', label: 'Accès eau', type: 'boolean', icon: 'Droplets' },
      { key: 'hasElectricity', label: 'Accès électricité', type: 'boolean', icon: 'Zap' },
      { key: 'hasRoad', label: 'Accès route bitumée', type: 'boolean', icon: 'MapPin' },
      { key: 'hasTitle', label: 'Titre foncier (ACD)', type: 'boolean', icon: 'Shield' },
    ],
    // Bureau
    bureau: [
      { key: 'propertyType', label: 'Type', type: 'select', icon: 'Building', options: ['Bureau', 'Open space', 'Coworking', 'Salle de réunion'] },
      { key: 'surface', label: 'Surface', type: 'number', unit: 'm²', icon: 'Ruler' },
      { key: 'rooms', label: 'Nombre de pièces', type: 'number', icon: 'Home' },
      { key: 'floor', label: 'Étage', type: 'number', icon: 'Building' },
      { key: 'hasAC', label: 'Climatisation', type: 'boolean', icon: 'Wind' },
      { key: 'hasParking', label: 'Parking', type: 'boolean', icon: 'ParkingCircle' },
      { key: 'hasInternet', label: 'Internet', type: 'boolean', icon: 'Wifi' },
      { key: 'hasSecurity', label: 'Sécurité', type: 'boolean', icon: 'Shield' },
    ],
    // Magasin / Commerce
    magasin: [
      { key: 'propertyType', label: 'Type de commerce', type: 'select', icon: 'Building', options: ['Magasin', 'Boutique', 'Superette', 'Entrepôt', 'Local commercial', 'Showroom'] },
      { key: 'surface', label: 'Surface', type: 'number', unit: 'm²', icon: 'Ruler' },
      { key: 'storageSurface', label: 'Surface stockage', type: 'number', unit: 'm²', icon: 'Package' },
      { key: 'frontage', label: 'Longueur façade', type: 'number', unit: 'm', icon: 'Ruler' },
      { key: 'hasVitrine', label: 'Vitrine', type: 'boolean', icon: 'Sun' },
      { key: 'hasToilets', label: 'Toilettes', type: 'boolean', icon: 'Bath' },
      { key: 'hasAC', label: 'Climatisation', type: 'boolean', icon: 'Wind' },
      { key: 'hasParking', label: 'Parking', type: 'boolean', icon: 'ParkingCircle' },
      { key: 'hasStorage', label: 'Réserve/Entrepôt', type: 'boolean', icon: 'Package' },
      { key: 'hasWater', label: 'Eau courante', type: 'boolean', icon: 'Droplets' },
      { key: 'hasElectricity', label: 'Électricité', type: 'boolean', icon: 'Zap' },
      { key: 'hasSecurity', label: 'Sécurité/Gardien', type: 'boolean', icon: 'Shield' },
    ],
    // Entrepôt / Hangar
    entrepot: [
      { key: 'propertyType', label: 'Type', type: 'select', icon: 'Package', options: ['Entrepôt', 'Hangar', 'Dépôt', 'Magasin de stockage'] },
      { key: 'surface', label: 'Surface', type: 'number', unit: 'm²', icon: 'Ruler' },
      { key: 'height', label: 'Hauteur plafond', type: 'number', unit: 'm', icon: 'Building' },
      { key: 'hasQuai', label: 'Quai de chargement', type: 'boolean', icon: 'Truck' },
      { key: 'hasPortail', label: 'Portail camion', type: 'boolean', icon: 'Truck' },
      { key: 'hasElectricity', label: 'Électricité', type: 'boolean', icon: 'Zap' },
      { key: 'hasSecurity', label: 'Sécurité 24h', type: 'boolean', icon: 'Shield' },
    ],
  },

  // ==================== VÉHICULES ====================
  vehicule: {
    // Voiture
    voiture: [
      { key: 'brand', label: 'Marque', type: 'text', icon: 'Car' },
      { key: 'model', label: 'Modèle', type: 'text', icon: 'Car' },
      { key: 'year', label: 'Année', type: 'number', icon: 'Calendar' },
      { key: 'mileage', label: 'Kilométrage', type: 'number', unit: 'km', icon: 'Gauge' },
      { key: 'fuel', label: 'Carburant', type: 'select', icon: 'Fuel', options: ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL'] },
      { key: 'transmission', label: 'Boîte de vitesse', type: 'select', icon: 'Settings', options: ['Manuelle', 'Automatique'] },
      { key: 'doors', label: 'Portes', type: 'select', icon: 'Car', options: ['2', '3', '4', '5'] },
      { key: 'color', label: 'Couleur', type: 'text', icon: 'Palette' },
      { key: 'condition', label: 'État', type: 'select', icon: 'Shield', options: ['Neuf', 'Très bon état', 'Bon état', 'État moyen', 'À réviser'] },
      { key: 'hasAC', label: 'Climatisation', type: 'boolean', icon: 'Wind' },
      { key: 'hasGPS', label: 'GPS', type: 'boolean', icon: 'MapPin' },
      { key: 'hasBluetooth', label: 'Bluetooth', type: 'boolean', icon: 'Wifi' },
      { key: 'hasLeather', label: 'Cuir', type: 'boolean', icon: 'Star' },
    ],
    // Moto
    moto: [
      { key: 'brand', label: 'Marque', type: 'text', icon: 'Bike' },
      { key: 'model', label: 'Modèle', type: 'text', icon: 'Bike' },
      { key: 'year', label: 'Année', type: 'number', icon: 'Calendar' },
      { key: 'mileage', label: 'Kilométrage', type: 'number', unit: 'km', icon: 'Gauge' },
      { key: 'engineSize', label: 'Cylindrée', type: 'number', unit: 'cc', icon: 'Settings' },
      { key: 'condition', label: 'État', type: 'select', icon: 'Shield', options: ['Neuf', 'Très bon état', 'Bon état', 'État moyen', 'À réviser'] },
    ],
    // Camion / Utilitaire
    utilitaire: [
      { key: 'brand', label: 'Marque', type: 'text', icon: 'Truck' },
      { key: 'model', label: 'Modèle', type: 'text', icon: 'Truck' },
      { key: 'year', label: 'Année', type: 'number', icon: 'Calendar' },
      { key: 'mileage', label: 'Kilométrage', type: 'number', unit: 'km', icon: 'Gauge' },
      { key: 'fuel', label: 'Carburant', type: 'select', icon: 'Fuel', options: ['Essence', 'Diesel'] },
      { key: 'loadCapacity', label: 'Charge utile', type: 'number', unit: 'kg', icon: 'Package' },
      { key: 'condition', label: 'État', type: 'select', icon: 'Shield', options: ['Neuf', 'Très bon état', 'Bon état', 'État moyen', 'À réviser'] },
    ],
  },

  // ==================== VACANCES ====================
  vacance: {
    // Location vacances
    location: [
      { key: 'propertyType', label: 'Type', type: 'select', icon: 'Home', options: ['Appartement', 'Maison', 'Villa', 'Bungalow', 'Suite hôtel', 'Chambre'] },
      { key: 'surface', label: 'Surface', type: 'number', unit: 'm²', icon: 'Ruler' },
      { key: 'capacity', label: 'Capacité', type: 'number', unit: 'pers.', icon: 'Users' },
      { key: 'bedrooms', label: 'Chambres', type: 'number', icon: 'Bed' },
      { key: 'beds', label: 'Lits', type: 'number', icon: 'Bed' },
      { key: 'bathrooms', label: 'Salles de bain', type: 'number', icon: 'Bath' },
      { key: 'hasAC', label: 'Climatisation', type: 'boolean', icon: 'Wind' },
      { key: 'hasPool', label: 'Piscine', type: 'boolean', icon: 'Droplets' },
      { key: 'hasWifi', label: 'Wifi', type: 'boolean', icon: 'Wifi' },
      { key: 'hasTv', label: 'Télévision', type: 'boolean', icon: 'Tv' },
      { key: 'hasKitchen', label: 'Cuisine équipée', type: 'boolean', icon: 'UtensilsCrossed' },
      { key: 'hasParking', label: 'Parking', type: 'boolean', icon: 'ParkingCircle' },
      { key: 'hasBeachAccess', label: 'Accès plage', type: 'boolean', icon: 'Sun' },
      { key: 'hasSecurity', label: 'Sécurité 24h', type: 'boolean', icon: 'Shield' },
    ],
  },
};

/**
 * Obtenir les spécifications pour une catégorie/sous-catégorie
 */
export function getSpecificationsForCategory(category, subcategory) {
  const categoryConfig = SPECIFICATIONS_CONFIG[category];
  if (!categoryConfig) return [];
  
  // Si sous-catégorie spécifique existe
  if (subcategory && categoryConfig[subcategory]) {
    return categoryConfig[subcategory];
  }
  
  // Sinon retourner la première sous-catégorie par défaut
  const firstKey = Object.keys(categoryConfig)[0];
  return categoryConfig[firstKey] || [];
}

/**
 * Obtenir les sous-catégories disponibles pour une catégorie
 */
export function getSubcategoriesForCategory(category) {
  const categoryConfig = SPECIFICATIONS_CONFIG[category];
  if (!categoryConfig) return [];
  return Object.keys(categoryConfig);
}

/**
 * Formater une valeur de spécification pour l'affichage
 */
export function formatSpecValue(spec, value) {
  if (value === null || value === undefined || value === '') return null;
  
  if (spec.type === 'boolean') {
    return value ? 'Oui' : 'Non';
  }
  
  if (spec.unit) {
    return `${value} ${spec.unit}`;
  }
  
  return String(value);
}
