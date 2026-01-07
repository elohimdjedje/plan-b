import api from './axios';
import cacheService from '../services/cacheService';

export const listingsAPI = {
  // Obtenir la liste des annonces avec filtres (avec cache)
  getListings: async (params = {}, options = {}) => {
    return cacheService.cachedFetch('listings', params, async () => {
      const response = await api.get('/listings', { params });
      return response.data;
    }, options);
  },

  // Obtenir une annonce par ID (avec cache)
  getListing: async (id, options = {}) => {
    return cacheService.cachedFetch('listing', { id }, async () => {
      const response = await api.get(`/listings/${id}`);
      return response.data;
    }, options);
  },

  // Créer une annonce (invalide le cache)
  createListing: async (data) => {
    const response = await api.post('/listings', data);
    // Invalider le cache des listings après création
    cacheService.invalidateType('listings');
    cacheService.invalidateType('recentListings');
    return response.data;
  },

  // Mettre à jour une annonce (invalide le cache)
  updateListing: async (id, data) => {
    const response = await api.put(`/listings/${id}`, data);
    // Invalider les caches concernés
    cacheService.invalidate('listing', { id });
    cacheService.invalidateType('listings');
    return response.data;
  },

  // Supprimer une annonce (invalide le cache)
  deleteListing: async (id) => {
    const response = await api.delete(`/listings/${id}`);
    // Invalider les caches concernés
    cacheService.invalidate('listing', { id });
    cacheService.invalidateType('listings');
    cacheService.invalidateType('recentListings');
    return response.data;
  },

  // Obtenir mes annonces
  getMyListings: async () => {
    const response = await api.get('/users/my-listings');
    return response.data;
  },

  // Rechercher des annonces (avec cache court)
  searchListings: async (query, filters = {}, options = {}) => {
    return cacheService.cachedFetch('search', { q: query, ...filters }, async () => {
      const response = await api.get('/search', {
        params: { q: query, ...filters }
      });
      return response.data;
    }, options);
  },

  // Upload d'images
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Incrémenter le compteur de contacts
  incrementContacts: async (id) => {
    const response = await api.post(`/listings/${id}/contact`);
    return response.data;
  },

  // Obtenir les annonces des vendeurs PRO (avec cache)
  getProListings: async (limit = 10, options = {}) => {
    return cacheService.cachedFetch('proListings', { limit }, async () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7e237e43-f19e-4769-9a08-acb76e6156a8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'pre-fix',
          hypothesisId: 'H3',
          location: 'src/api/listings.js:getProListings',
          message: 'Calling getProListings',
          data: { limit },
          timestamp: Date.now()
        })
      }).catch(() => {});
      // #endregion agent log

      const response = await api.get('/listings/pro', { params: { limit } });
      return response.data;
    }, options);
  },

  // Obtenir les annonces récentes (avec cache)
  getRecentListings: async (params = {}, options = {}) => {
    return cacheService.cachedFetch('recentListings', params, async () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7e237e43-f19e-4769-9a08-acb76e6156a8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'pre-fix',
          hypothesisId: 'H4',
          location: 'src/api/listings.js:getRecentListings',
          message: 'Calling getRecentListings',
          data: { params },
          timestamp: Date.now()
        })
      }).catch(() => {});
      // #endregion agent log

      const response = await api.get('/listings/recent', { params });
      return response.data;
    }, options);
  },

  // Précharger une annonce en arrière-plan
  prefetchListing: (id) => {
    cacheService.prefetch('listing', { id }, async () => {
      const response = await api.get(`/listings/${id}`);
      return response.data;
    });
  },

  // Invalider le cache manuellement
  invalidateCache: (type = 'all') => {
    if (type === 'all') {
      cacheService.clear();
    } else {
      cacheService.invalidateType(type);
    }
  }
};
