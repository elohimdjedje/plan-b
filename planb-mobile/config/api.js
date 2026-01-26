import { Platform } from 'react-native';

// ⚠️ IMPORTANT : Remplacez par votre adresse IP locale
// Pour trouver votre IP : ipconfig (Windows) ou ifconfig (Mac/Linux)
const LOCAL_IP = '192.168.1.176'; // <- VOTRE IP LOCALE ICI

// Configuration de l'API selon l'environnement
const API_BASE_URL = __DEV__
  ? `http://${LOCAL_IP}:8000/api/v1`  // Développement : utiliser l'IP locale
  : 'https://votre-domaine.com/api/v1';  // Production : votre domaine

export default {
  API_BASE_URL,
  TIMEOUT: 10000,  // Timeout de 10 secondes
  
  // Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    
    // Listings
    LISTINGS: '/listings',
    MY_LISTINGS: '/users/my-listings',
    
    // Categories
    CATEGORIES: '/categories',
    
    // Search
    SEARCH: '/search',
  },
};

// Helper pour construire les URLs complètes
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Configuration Axios
export const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
