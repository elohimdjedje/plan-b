/**
 * Configuration globale de l'application
 */

// Mode de l'application
export const APP_MODE = import.meta.env.VITE_APP_MODE || 'production'; // 'demo' ou 'production'

// URL de l'API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Configuration
export const config = {
  // Mode démo (utilise localStorage et données factices)
  isDemoMode: APP_MODE === 'demo',
  
  // Mode production (utilise le backend réel)
  isProductionMode: APP_MODE === 'production',
  
  // URL de l'API
  apiUrl: API_URL,
  
  // Limites FREE
  free: {
    maxListings: 3,
    maxPhotos: 3,
    listingDuration: 30, // jours
    editCost: 1500, // FCFA
    republishCost: 1500 // FCFA
  },
  
  // Limites PRO
  pro: {
    maxListings: Infinity,
    maxPhotos: 10,
    listingDuration: Infinity,
    editCost: 0,
    republishCost: 0,
    monthlyPrice: 10000, // FCFA
    quarterlyPrice: 25000 // FCFA
  },
  
  // Pagination
  pagination: {
    defaultLimit: 20
  },
  
  // WhatsApp
  whatsapp: {
    countryCode: '+225'
  }
};

export default config;
