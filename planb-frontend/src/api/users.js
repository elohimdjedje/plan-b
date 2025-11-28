import api from './axios';

/**
 * API pour gérer les utilisateurs
 */
export const usersAPI = {
  /**
   * Obtenir le profil public d'un vendeur
   */
  getPublicProfile: async (userId) => {
    const response = await api.get(`/users/${userId}/public-profile`);
    return response.data;
  },

  /**
   * Mettre à jour son propre profil
   */
  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  /**
   * Changer son mot de passe
   */
  changePassword: async (data) => {
    const response = await api.put('/users/password', data);
    return response.data;
  },

  /**
   * Obtenir ses statistiques
   */
  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  /**
   * Supprimer son compte
   */
  deleteAccount: async (password) => {
    const response = await api.delete('/users/account', {
      data: { password }
    });
    return response.data;
  },

  /**
   * Obtenir ses propres annonces
   */
  getMyListings: async (params = {}) => {
    const response = await api.get('/users/my-listings', { params });
    return response.data;
  }
};

export default usersAPI;
