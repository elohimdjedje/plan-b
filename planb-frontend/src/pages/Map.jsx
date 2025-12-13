import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, Search, MapPin, Building2, Home, Car, Hotel, Trees, Navigation, X, Route } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileContainer from '../components/layout/MobileContainer';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { listingsAPI } from '../api/listings';
import { CITIES_LIST, getCommunes } from '../constants/locations';
import { getImageUrl, IMAGE_PLACEHOLDER } from '../utils/images';
import 'leaflet/dist/leaflet.css';

// Corriger les icônes par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Couleurs par type de bien
const PROPERTY_COLORS = {
  // Immobilier
  maison: '#F59E0B', // Jaune/Orange
  villa: '#EF4444', // Rouge
  appartement: '#3B82F6', // Bleu
  studio: '#8B5CF6', // Violet
  terrain: '#84CC16', // Vert citron
  duplex: '#EC4899', // Rose
  
  // Vacances
  hotel: '#10B981', // Vert
  residence: '#06B6D4', // Cyan
  
  // Véhicules - Vente
  'vehicule-vente': '#2563EB', // Bleu foncé
  
  // Véhicules - Location
  'vehicule-location': '#7C3AED', // Violet foncé
  
  // Par défaut
  default: '#6B7280' // Gris
};

// Créer des icônes personnalisées
const createCustomIcon = (color, subcategory) => {
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="transform: rotate(45deg); color: white; font-size: 16px; font-weight: bold;">
        ${subcategory ? subcategory.charAt(0).toUpperCase() : '•'}
      </div>
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// Composant pour recentrer la carte
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      try {
        map.setView(center, zoom);
      } catch (error) {
        console.warn('Erreur setView:', error);
      }
    }
  }, [center, zoom, map]);
  return null;
}

/**
 * Page de carte interactive avec marqueurs géolocalisés
 */
export default function Map() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [allListings, setAllListings] = useState([]); // Toutes les annonces
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([7.54, -5.55]); // Centre Côte d'Ivoire
  const [mapZoom, setMapZoom] = useState(7); // Vue large de la Côte d'Ivoire
  
  // Filtres
  const [filters, setFilters] = useState({
    country: 'CI',
    city: '',
    commune: ''
  });
  
  const [communes, setCommunes] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPosition, setUserPosition] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeDestination, setRouteDestination] = useState(null);

  // Coordonnées GPS complètes de TOUTES les villes de Côte d'Ivoire
  const cityCoordinates = {
    // REGION ABIDJAN
    'Abidjan': [5.3600, -4.0083],
    
    // REGION BAS-SASSANDRA
    'San-Pedro': [4.7485, -6.6363],
    'Sassandra': [4.9500, -6.0833],
    'Tabou': [4.4230, -7.3525],
    'Soubre': [5.7856, -6.5978],
    'Guiglo': [6.5447, -7.4947],
    'Toulepleu': [6.5833, -8.4333],
    
    // REGION COMOE
    'Abengourou': [6.7294, -3.4967],
    'Agnibilekrou': [7.1333, -3.2000],
    'Bondoukou': [8.0403, -2.8000],
    'Tanda': [7.8000, -3.1667],
    'Transua': [7.7167, -3.3333],
    
    // REGION DENGUELE
    'Odienne': [9.5075, -7.5642],
    'Minignan': [9.5667, -8.2667],
    'Madinani': [9.4167, -7.0833],
    
    // REGION GOH-DJIBOUA
    'Gagnoa': [6.1319, -5.9506],
    'Oume': [6.3833, -5.4167],
    'Divo': [5.8372, -5.3572],
    'Lakota': [5.8500, -5.6833],
    
    // REGION LACS
    'Yamoussoukro': [6.8276, -5.2893],
    'Tiebissou': [7.1581, -5.2256],
    'Toumodi': [6.5564, -5.0169],
    'Dimbokro': [6.6467, -4.7064],
    'Bocanda': [7.0667, -4.5000],
    
    // REGION LAGUNES
    'Dabou': [5.3256, -4.3769],
    'Agboville': [5.9333, -4.2167],
    'Tiassale': [5.8981, -4.8236],
    'Grand-Lahou': [5.2500, -5.0167],
    'Adzope': [6.1069, -3.8583],
    'Akoupe': [6.3833, -3.8833],
    
    // REGION MONTAGNES
    'Man': [7.4125, -7.5544],
    'Danane': [7.2667, -8.1500],
    'Biankouma': [7.7408, -7.6231],
    'Zouan-Hounien': [6.9167, -8.2167],
    'Bangolo': [7.0133, -7.4856],
    'Duekoue': [6.7333, -7.3333],
    
    // REGION SASSANDRA-MARAHOUE
    'Daloa': [6.8770, -6.4503],
    'Issia': [6.4917, -6.5878],
    'Vavoua': [7.3825, -6.4778],
    'Bouafle': [6.9833, -5.7500],
    'Zuenoula': [7.4250, -6.0500],
    
    // REGION SAVANES
    'Korhogo': [9.4580, -5.6297],
    'Ferkessedougou': [9.5989, -5.1958],
    'Kong': [9.1500, -4.6167],
    'Boundiali': [9.5244, -6.4711],
    'Tengrela': [10.4833, -6.4167],
    
    // REGION SUD-COMOE
    'Grand-Bassam': [5.2111, -3.7385],
    'Aboisso': [5.4667, -3.2000],
    'Adiake': [5.2917, -3.2989],
    'Assinie': [5.1394, -3.3014],
    
    // REGION VALLEE DU BANDAMA
    'Bouaké': [7.6900, -5.0300],
    'Katiola': [8.1333, -5.0667],
    'Dabakala': [8.3667, -4.4333],
    'Sakassou': [7.4500, -5.2833],
    'Niakaramadougou': [8.6597, -5.2900],
    
    // REGION WOROBA
    'Seguela': [7.9611, -6.6731],
    'Touba': [8.2833, -7.6833],
    'Mankono': [8.0586, -6.1900],
    
    // REGION ZANZAN
    'Bouna': [9.2667, -3.0000],
    'Doropo': [9.8167, -3.3500],
    'Nassian': [8.4500, -3.5167],
    'Tehini': [9.5167, -3.6167],
    
    // REGION GBEKE (ajout)
    'Tiassale': [5.8981, -4.8236],
    'Beoumi': [7.6742, -5.5811]
  };

  // Charger toutes les annonces au démarrage
  useEffect(() => {
    loadAllListings();
  }, []);

  // Charger les communes quand la ville change
  useEffect(() => {
    if (filters.city) {
      const communesList = getCommunes(filters.city);
      setCommunes(communesList);
    } else {
      setCommunes([]);
      setFilters(prev => ({ ...prev, commune: '' }));
    }
  }, [filters.city]);

  // Filtrer et centrer la carte selon les filtres
  useEffect(() => {
    if (filters.city) {
      // Centrer sur la ville
      const coords = cityCoordinates[filters.city];
      if (coords) {
        setMapCenter(coords);
        setMapZoom(13);
      }
      
      // Filtrer les annonces
      filterListings();
    } else {
      // Aucune ville sélectionnée : afficher toutes les annonces
      setListings(allListings);
      setMapCenter([7.54, -5.55]); // Centrer sur la Côte d'Ivoire
      setMapZoom(7);
    }
  }, [filters.city, filters.commune, allListings]);

  // Charger toutes les annonces
  const loadAllListings = async () => {
    // Ne montrer le loading que si on n'a pas de données
    if (allListings.length === 0) {
      setLoading(true);
    }
    try {
      // Utiliser le cache automatique via listingsAPI
      const response = await listingsAPI.getListings({ country: 'CI' });
      
      const data = response.data || [];
      
      // Coordonnées par défaut (centre de la Côte d'Ivoire) pour les villes inconnues
      const defaultCoords = [7.54, -5.55];
      
      // Géocoder automatiquement les annonces sans GPS
      const geocodedListings = data.map(listing => {
        // Si pas de GPS, utiliser les coordonnées de la ville ou par défaut
        if (!listing.latitude || !listing.longitude) {
          const coords = cityCoordinates[listing.city] || defaultCoords;
          return {
            ...listing,
            latitude: parseFloat(coords[0]) + (Math.random() * 0.02 - 0.01), // Légère variation
            longitude: parseFloat(coords[1]) + (Math.random() * 0.02 - 0.01)
          };
        }
        return {
          ...listing,
          latitude: parseFloat(listing.latitude),
          longitude: parseFloat(listing.longitude)
        };
      }).filter(listing => {
        // Vérifier que les coordonnées sont valides
        const isValid = !isNaN(listing.latitude) && 
                       !isNaN(listing.longitude) && 
                       listing.latitude >= -90 && 
                       listing.latitude <= 90 &&
                       listing.longitude >= -180 && 
                       listing.longitude <= 180;
        
        if (!isValid) {
          console.warn(`⚠️ Annonce ${listing.id} a des coordonnées invalides:`, listing.latitude, listing.longitude);
        }
        
        return isValid;
      });
      
      // TOUTES les annonces ont maintenant des coordonnées valides
      setAllListings(geocodedListings);
      setListings(geocodedListings);
      
      console.log(`✅ ${geocodedListings.length} annonces valides chargées sur la carte`);
    } catch (error) {
      console.error('❌ Erreur chargement annonces:', error);
      
      // Afficher un message d'erreur à l'utilisateur
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.warn('⏱️ Timeout - Le serveur met trop de temps à répondre');
      }
      
      // En cas d'erreur, initialiser avec un tableau vide
      setAllListings([]);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les annonces selon ville/commune
  const filterListings = () => {
    let filtered = [...allListings];
    
    if (filters.city) {
      filtered = filtered.filter(l => l.city === filters.city);
    }
    
    if (filters.commune) {
      filtered = filtered.filter(l => l.commune === filters.commune);
    }
    
    setListings(filtered);
  };


  // Obtenir la couleur selon le type de bien
  const getMarkerColor = (listing) => {
    // Pour les véhicules, différencier vente/location
    if (listing.category === 'vehicule') {
      return listing.type === 'vente' 
        ? PROPERTY_COLORS['vehicule-vente'] 
        : PROPERTY_COLORS['vehicule-location'];
    }
    
    // Pour les autres, utiliser la sous-catégorie
    const subcategory = listing.subcategory?.toLowerCase();
    return PROPERTY_COLORS[subcategory] || PROPERTY_COLORS.default;
  };

  // Formater le prix
  const formatPrice = (price) => {
    if (!price) return 'Prix non spécifié';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Géolocaliser l'utilisateur
  const geolocateUser = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = [position.coords.latitude, position.coords.longitude];
          setUserPosition(userCoords);
          setMapCenter(userCoords);
          setMapZoom(13);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          alert('Impossible d\'obtenir votre position. Veuillez autoriser la géolocalisation.');
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
    }
  };

  // Calculer l'itinéraire
  const showRouteToListing = (listing) => {
    if (!userPosition) {
      alert('Veuillez d\'abord activer votre géolocalisation');
      return;
    }
    setRouteDestination([listing.latitude, listing.longitude]);
    setShowRoute(true);
    // Centrer la vue pour voir les deux points
    const bounds = L.latLngBounds([userPosition, [listing.latitude, listing.longitude]]);
    setMapCenter(bounds.getCenter());
    setMapZoom(12);
  };

  // Calculer la distance entre deux points (en km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filtrer les annonces par recherche
  const filteredListings = searchQuery
    ? listings.filter(listing => 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : listings;

  // Créer l'icône de position utilisateur
  const userIcon = L.divIcon({
    html: `
      <div style="
        background-color: #3B82F6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
      "></div>
    `,
    className: 'user-position-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  return (
    <MobileContainer showNav={false}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Carte des Annonces</h1>
              <p className="text-xs text-white/80">
                {listings.length} annonce{listings.length > 1 ? 's' : ''} géolocalisée{listings.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Barre de recherche et géolocalisation */}
        <GlassCard>
          <div className="space-y-3">
            {/* Recherche de bien */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un bien (titre, ville, description...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white/80 rounded-xl border-2 border-secondary-200 focus:border-primary-500 focus:outline-none transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Bouton de géolocalisation */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={geolocateUser}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Navigation size={18} />
                Ma position
              </Button>
              
              {showRoute && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRoute(false);
                    setRouteDestination(null);
                  }}
                  className="flex items-center gap-2 bg-red-50 text-red-600 border-red-300 hover:bg-red-100"
                >
                  <X size={18} />
                  Annuler itinéraire
                </Button>
              )}
            </div>

            {/* Affichage du résultat de recherche */}
            {searchQuery && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-700">
                  🔍 <strong>{filteredListings.length}</strong> résultat{filteredListings.length > 1 ? 's' : ''} trouvé{filteredListings.length > 1 ? 's' : ''} pour "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Filtres */}
        <GlassCard>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-primary-500" />
            Filtres de localisation
          </h3>
          
          <div className="space-y-3">
            {/* Ville */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Ville (Facultatif)
              </label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value, commune: '' })}
                className="w-full px-4 py-3 bg-white/80 rounded-xl border-2 border-secondary-200 focus:border-primary-500 focus:outline-none transition-all duration-200"
              >
                <option value="">Toute la Côte d'Ivoire</option>
                {CITIES_LIST.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Commune (optionnel) */}
            {filters.city && communes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                  Commune (Facultatif)
                </label>
                <select
                  value={filters.commune}
                  onChange={(e) => setFilters({ ...filters, commune: e.target.value })}
                  className="w-full px-4 py-3 bg-white/80 rounded-xl border-2 border-secondary-200 focus:border-primary-500 focus:outline-none transition-all duration-200"
                >
                  <option value="">Toutes les communes</option>
                  {communes.map(commune => (
                    <option key={commune} value={commune}>{commune}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-700">
                💡 <strong>Astuce :</strong> Sélectionnez une ville pour zoomer et filtrer les annonces.
                Laissez vide pour voir toute la Côte d'Ivoire.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Légende des couleurs */}
        {listings.length > 0 && (
          <GlassCard className="bg-blue-50/80 border-blue-200">
            <h4 className="font-semibold text-sm mb-3 text-blue-900">Légende des marqueurs</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: PROPERTY_COLORS.maison }}></div>
                <span>Maison</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: PROPERTY_COLORS.villa }}></div>
                <span>Villa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: PROPERTY_COLORS.appartement }}></div>
                <span>Appartement</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: PROPERTY_COLORS.hotel }}></div>
                <span>Hôtel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: PROPERTY_COLORS['vehicule-vente'] }}></div>
                <span>Véhicule (Vente)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: PROPERTY_COLORS['vehicule-location'] }}></div>
                <span>Véhicule (Location)</span>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Carte */}
        {!loading && mapCenter && Array.isArray(mapCenter) && mapCenter.length === 2 && (
          <GlassCard className="p-0 overflow-hidden">
            <div style={{ height: '500px', width: '100%' }}>
              <ErrorBoundary>
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <ChangeView center={mapCenter} zoom={mapZoom} />
                
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Marqueur de position utilisateur */}
                {userPosition && (
                  <Marker position={userPosition} icon={userIcon}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-bold text-blue-600">📍 Votre position</p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Ligne d'itinéraire */}
                {showRoute && userPosition && routeDestination && (
                  <Polyline
                    positions={[userPosition, routeDestination]}
                    color="#3B82F6"
                    weight={4}
                    opacity={0.7}
                    dashArray="10, 10"
                  />
                )}

                {/* Marqueurs des annonces (utiliser filteredListings pour la recherche) */}
                {filteredListings
                  .filter(listing => {
                    // Vérifier que les coordonnées sont valides avant de rendre le marqueur
                    return listing.latitude && 
                           listing.longitude && 
                           !isNaN(listing.latitude) && 
                           !isNaN(listing.longitude);
                  })
                  .map((listing) => (
                    <Marker
                      key={listing.id}
                      position={[listing.latitude, listing.longitude]}
                      icon={createCustomIcon(
                        getMarkerColor(listing),
                        listing.subcategory
                      )}
                      eventHandlers={{
                        click: () => setSelectedListing(listing)
                      }}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          <img
                            src={getImageUrl(listing.mainImage || listing.images?.[0]?.url) || IMAGE_PLACEHOLDER}
                            alt={listing.title}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                            onError={(e) => { e.target.src = IMAGE_PLACEHOLDER; }}
                          />
                          <h4 className="font-bold text-sm mb-1">{listing.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">
                            {listing.city} {listing.commune && `- ${listing.commune}`}
                          </p>
                          <p className="text-sm font-bold text-primary-600 mb-2">
                            {formatPrice(listing.price)}
                            {listing.type === 'location' && listing.priceUnit && (
                              <span className="text-xs"> /{listing.priceUnit}</span>
                            )}
                          </p>
                          
                          {/* Distance si position utilisateur disponible */}
                          {userPosition && (
                            <p className="text-xs text-gray-500 mb-2">
                              📏 {calculateDistance(
                                userPosition[0], 
                                userPosition[1], 
                                listing.latitude, 
                                listing.longitude
                              ).toFixed(1)} km
                            </p>
                          )}

                          <div className="space-y-2">
                            <Button
                              size="sm"
                              fullWidth
                              onClick={() => navigate(`/listing/${listing.id}`)}
                            >
                              Voir l'annonce
                            </Button>
                            
                            {userPosition && (
                              <Button
                                size="sm"
                                variant="outline"
                                fullWidth
                                onClick={() => showRouteToListing(listing)}
                                className="flex items-center justify-center gap-2"
                              >
                                <Route size={16} />
                                Itinéraire
                              </Button>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
              </ErrorBoundary>
            </div>
          </GlassCard>
        )}
        
        {/* Message si aucune annonce */}
        {!loading && listings.length === 0 && (
          <GlassCard className="text-center py-8 bg-yellow-50/80 border-yellow-200">
            <MapPin size={48} className="mx-auto text-yellow-400 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Aucune annonce disponible
            </h3>
            <p className="text-sm text-gray-600">
              {filters.city 
                ? `Aucune annonce trouvée pour ${filters.city}${filters.commune ? ' - ' + filters.commune : ''}`
                : "Aucune annonce géolocalisée disponible pour le moment"
              }
            </p>
          </GlassCard>
        )}

        {/* Message si chargement */}
        {loading && (
          <GlassCard className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">
              Chargement des annonces...
            </p>
          </GlassCard>
        )}
      </div>
    </MobileContainer>
  );
}
