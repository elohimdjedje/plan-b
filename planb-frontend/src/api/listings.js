import api from './axios';

export const listingsAPI = {
  // Obtenir la liste des annonces avec filtres
  getListings: async (params = {}) => {
    const response = await api.get('/listings', { params });
    return response.data;
  },

  // Obtenir une annonce par ID
  getListing: async (id) => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  },

  // Créer une annonce
  createListing: async (data) => {
    const response = await api.post('/listings', data);
    return response.data;
  },

  // Mettre à jour une annonce
  updateListing: async (id, data) => {
    const response = await api.put(`/listings/${id}`, data);
    return response.data;
  },

  // Supprimer une annonce
  deleteListing: async (id) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },

  // Obtenir mes annonces
  getMyListings: async () => {
    const response = await api.get('/users/my-listings');
    return response.data;
  },

  // Rechercher des annonces
  searchListings: async (query, filters = {}) => {
    const response = await api.get('/search', {
      params: { q: query, ...filters }
    });
    return response.data;
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
};
