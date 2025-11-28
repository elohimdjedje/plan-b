import axios from 'axios';
import toast from 'react-hot-toast';

// URL de base de l'API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Instance Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 secondes (2 minutes) pour les requêtes lentes
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion des erreurs réseau
    if (!error.response) {
      // Erreur silencieuse pour les appels automatiques (getCurrentUser)
      if (!error.config?.showError) {
        return Promise.reject(error);
      }
      
      // Erreur de timeout spécifique
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        toast.error('Le serveur met trop de temps à répondre. Réessayez.');
      } else {
        toast.error('Erreur de connexion. Vérifiez votre internet.');
      }
      return Promise.reject(error);
    }

    // Gestion des erreurs HTTP
    const { status, data } = error.response;
    const showError = error.config?.showError !== false;

    switch (status) {
      case 401:
        // Non authentifié - silencieux pour /auth/me
        if (error.config?.url?.includes('/auth/me')) {
          localStorage.removeItem('token');
          return Promise.reject(error);
        }
        if (showError) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
        }
        localStorage.removeItem('token');
        window.location.href = '/auth';
        break;
      case 403:
        if (showError) toast.error('Accès refusé.');
        break;
      case 404:
        if (showError) toast.error('Ressource non trouvée.');
        break;
      case 422:
        // Erreurs de validation
        if (showError) {
          if (data.errors) {
            Object.values(data.errors).forEach((messages) => {
              messages.forEach((msg) => toast.error(msg));
            });
          } else {
            toast.error(data.message || 'Données invalides.');
          }
        }
        break;
      case 500:
        if (showError) toast.error('Erreur serveur. Réessayez plus tard.');
        break;
      default:
        if (showError) toast.error(data.message || 'Une erreur est survenue.');
    }

    return Promise.reject(error);
  }
);

export default api;
