import api from './axios';

export const roomsAPI = {
  /**
   * Liste des chambres d'un listing (groupées par type)
   */
  getByListing: async (listingId) => {
    const response = await api.get(`/rooms/listing/${listingId}`);
    return response.data;
  },

  /**
   * Chambres disponibles pour une période
   */
  getAvailable: async (listingId, startDate, endDate) => {
    const response = await api.get(`/rooms/listing/${listingId}/available`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  /**
   * Détail d'une chambre avec calendrier optionnel
   */
  get: async (roomId, withCalendar = false, startDate = null, endDate = null) => {
    const params = {};
    if (withCalendar) {
      params.with_calendar = true;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
    }
    const response = await api.get(`/rooms/${roomId}`, { params });
    return response.data;
  },

  /**
   * Créer une chambre
   */
  create: async (listingId, data) => {
    const response = await api.post(`/rooms/listing/${listingId}`, data);
    return response.data;
  },

  /**
   * Modifier une chambre
   */
  update: async (roomId, data) => {
    const response = await api.put(`/rooms/${roomId}`, data);
    return response.data;
  },

  /**
   * Supprimer une chambre
   */
  delete: async (roomId) => {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
  },

  /**
   * Vérifier disponibilité d'une chambre
   */
  checkAvailability: async (roomId, startDate, endDate) => {
    const response = await api.post(`/rooms/${roomId}/check-availability`, {
      start_date: startDate,
      end_date: endDate
    });
    return response.data;
  }
};
