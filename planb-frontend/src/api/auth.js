import api from './axios';

export const authAPI = {
  // Inscription
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Connexion
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Obtenir le profil utilisateur
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Mise à jour du profil
  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  // Changement de mot de passe
  changePassword: async (passwords) => {
    const response = await api.put('/users/password', passwords);
    return response.data;
  },

  // Suppression de compte
  deleteAccount: async () => {
    const response = await api.delete('/users/account');
    return response.data;
  },
};
