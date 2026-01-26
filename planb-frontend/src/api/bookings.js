import api from './axios';

export const bookingsAPI = {
  /**
   * Créer une demande de réservation
   */
  create: async (listingId, startDate, endDate, message = null) => {
    const response = await api.post('/bookings', {
      listing_id: listingId,
      start_date: startDate,
      end_date: endDate,
      message
    });
    return response.data;
  },

  /**
   * Liste des réservations
   */
  list: async (role = null) => {
    const params = role ? { role } : {};
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  /**
   * Détails d'une réservation
   */
  get: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Accepter une réservation
   */
  accept: async (id, response = null) => {
    const res = await api.post(`/bookings/${id}/accept`, { response });
    return res.data;
  },

  /**
   * Refuser une réservation
   */
  reject: async (id, reason = null) => {
    const res = await api.post(`/bookings/${id}/reject`, { reason });
    return res.data;
  },

  /**
   * Annuler une réservation
   */
  cancel: async (id, reason = null) => {
    const res = await api.post(`/bookings/${id}/cancel`, { reason });
    return res.data;
  },

  /**
   * Vérifier la disponibilité
   */
  checkAvailability: async (listingId, startDate, endDate, excludeBookingId = null) => {
    const res = await api.post('/bookings/check-availability', {
      listing_id: listingId,
      start_date: startDate,
      end_date: endDate,
      exclude_booking_id: excludeBookingId
    });
    return res.data;
  }
};
