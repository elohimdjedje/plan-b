import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const conversationsApi = {
  // Récupérer toutes les conversations
  getAll: async () => {
    const response = await axios.get(`${API_URL}/conversations`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Récupérer une conversation spécifique
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/conversations/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Démarrer une nouvelle conversation
  start: async (listingId) => {
    const response = await axios.post(
      `${API_URL}/conversations/start/${listingId}`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  },
};

export default conversationsApi;
