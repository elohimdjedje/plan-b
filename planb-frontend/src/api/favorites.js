import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const favoritesApi = {
  /**
   * Récupérer tous les favoris de l'utilisateur
   * @returns {Promise<Object>}
   */
  getAll: async () => {
    const response = await axios.get(`${API_URL}/favorites`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  /**
   * Ajouter une annonce aux favoris
   * @param {number} listingId - ID de l'annonce
   * @returns {Promise<Object>}
   */
  add: async (listingId) => {
    const response = await axios.post(
      `${API_URL}/favorites/${listingId}`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  /**
   * Retirer une annonce des favoris
   * @param {number} listingId - ID de l'annonce
   * @returns {Promise<Object>}
   */
  remove: async (listingId) => {
    const response = await axios.delete(`${API_URL}/favorites/${listingId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  /**
   * Vérifier si une annonce est en favoris
   * @param {number} listingId - ID de l'annonce
   * @returns {Promise<Object>}
   */
  check: async (listingId) => {
    const response = await axios.get(`${API_URL}/favorites/check/${listingId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },
};

export default favoritesApi;
