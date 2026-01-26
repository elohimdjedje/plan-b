import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * API de recherche
 */
export const searchAPI = {
  /**
   * Recherche avancée d'annonces
   */
  search: async (params) => {
    const response = await axios.get(`${API_URL}/search`, { params });
    return response.data;
  },

  /**
   * Obtenir les catégories avec compteurs
   */
  getCategories: async () => {
    const response = await axios.get(`${API_URL}/search/categories`);
    return response.data;
  },

  /**
   * Obtenir les villes populaires
   */
  getCities: async (country = null) => {
    const params = country ? { country } : {};
    const response = await axios.get(`${API_URL}/search/cities`, { params });
    return response.data;
  },

  /**
   * Obtenir les suggestions d'autocomplétion
   */
  getSuggestions: async (query) => {
    const response = await axios.get(`${API_URL}/search/suggestions`, {
      params: { q: query }
    });
    return response.data;
  },

  /**
   * Obtenir les recherches populaires avec compteurs réels
   */
  getPopularSearches: async () => {
    const response = await axios.get(`${API_URL}/search/popular`);
    return response.data;
  },

  /**
   * Obtenir les statistiques de recherche
   */
  getStats: async () => {
    const response = await axios.get(`${API_URL}/search/stats`);
    return response.data;
  }
};
