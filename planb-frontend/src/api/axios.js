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
  timeout: 30000, // 30 secondes - équilibre entre rapidité et fiabilité
});

// ============================================
// CONFIGURATION DES ROUTES
// ============================================

// Routes qui ne nécessitent JAMAIS de token (uniquement GET)
const PUBLIC_GET_ROUTES = [
  '/listings',
  '/categories',
  '/search',
  '/reviews',
];

// Routes qui ne nécessitent JAMAIS de token (toutes méthodes)
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/webhooks',
];

// Routes où on ne doit PAS afficher d'erreur toast
const SILENT_ROUTES = [
  '/auth/me',
  '/auth/login',
  '/auth/register',
  '/notifications/count',
  '/notifications/unread-count',
];

// Vérifier si une route est publique selon la méthode HTTP
const isPublicRoute = (url, method = 'GET') => {
  if (!url) return false;

  // Routes toujours publiques
  if (PUBLIC_ROUTES.some(route => url.includes(route))) {
    return true;
  }

  // Routes publiques uniquement en GET
  if (method.toUpperCase() === 'GET') {
    return PUBLIC_GET_ROUTES.some(route => url.includes(route));
  }

  return false;
};

// Vérifier si une route doit être silencieuse
const isSilentRoute = (url) => {
  if (!url) return false;
  return SILENT_ROUTES.some(route => url.includes(route));
};

// ============================================
// GESTION DU TOKEN
// ============================================

let isCleaningUp = false;

const cleanupAuth = () => {
  if (isCleaningUp) return;
  isCleaningUp = true;

  console.warn('[AXIOS] cleanupAuth() appelé - suppression du token!');
  console.trace('[AXIOS] Stack trace du cleanup:');

  // Nettoyer localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('planb-auth-storage');

  // Nettoyer le store Zustand
  if (window.useAuthStore) {
    try {
      window.useAuthStore.getState().logout();
    } catch (e) {
      // Ignorer les erreurs
    }
  }

  // Reset après délai
  setTimeout(() => {
    isCleaningUp = false;
  }, 2000);
};

// ============================================
// INTERCEPTEUR REQUEST
// ============================================

api.interceptors.request.use(
  (config) => {
    // Ajouter le token seulement si présent
    const token = localStorage.getItem('token');

    const method = config.method?.toUpperCase() || 'GET';
    const url = config.url || '';
    const publicRoute = isPublicRoute(url, method);

    // Debug logging pour diagnostiquer les problèmes d'auth
    console.log('[AXIOS] Request:', method, url, '| isPublicRoute =', publicRoute);
    console.log('[AXIOS] Token présent:', !!token, token ? token.substring(0, 20) + '...' : 'null');

    // Pour les routes publiques, NE PAS envoyer de token (hypothèse H1)
    if (token && !publicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// INTERCEPTEUR RESPONSE
// ============================================

api.interceptors.response.use(
  // Succès - reset du flag
  (response) => {
    isCleaningUp = false;
    return response;
  },

  // Erreur
  async (error) => {
    const config = error.config || {};
    const url = config?.url || '';
    const method = (config?.method || 'GET').toUpperCase();
    const isRetry = config?._retry;

    // Pas de réponse = erreur réseau
    if (!error.response) {
      // Limiter les toasts de timeout et respecter les routes silencieuses
      if (error.code === 'ECONNABORTED' && !isSilentRoute(url)) {
        toast.error('Connexion lente. Réessayez.', { id: 'slow-connection' });
      }
      return Promise.reject(error);
    }

    // Code HTTP de la réponse
    const { status } = error.response;

    // ========== GESTION 401 ==========
    if (status === 401) {
      const hasToken = !!localStorage.getItem('token');
      console.error('[AXIOS] 401 reçu pour:', url, '| method:', method);
      console.log('[AXIOS] Token actuel:', hasToken ? 'présent' : 'absent');

      // NE JAMAIS supprimer le token automatiquement
      // L'utilisateur doit se déconnecter manuellement ou le token expire naturellement
      // Afficher juste un message si ce n'est pas une route silencieuse
      if (!isSilentRoute(url) && !url.includes('/auth/')) {
        toast.error('Session expirée. Veuillez vous reconnecter.', { id: 'session-expired' });
      }
    }

    // ========== AUTRES ERREURS ==========
    else if (!isSilentRoute(url)) {
      switch (status) {
        case 403:
          toast.error('Accès non autorisé', { id: 'forbidden' });
          break;
        case 404:
          // Silencieux pour 404
          break;
        case 422:
          const data = error.response.data;
          if (data?.message) {
            toast.error(data.message, { id: 'validation' });
          }
          break;
        case 500:
          toast.error('Erreur serveur', { id: 'server-error' });
          break;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
