/**
 * API pour les créneaux de visite
 */
import api from './axios';

export const visitSlotsAPI = {
  // Récupérer les créneaux disponibles pour une annonce
  getByListing: async (listingId) => {
    const response = await api.get(`/visit-slots/listing/${listingId}`);
    return response.data;
  },

  // Récupérer mes créneaux (propriétaire)
  getMySlots: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/visit-slots/my-slots', { params });
    return response.data;
  },

  // Récupérer mes réservations de visite (client)
  getMyBookings: async () => {
    const response = await api.get('/visit-slots/my-bookings');
    return response.data;
  },

  // Créer un nouveau créneau
  create: async (data) => {
    const response = await api.post('/visit-slots', data);
    return response.data;
  },

  // Modifier un créneau
  update: async (id, data) => {
    const response = await api.put(`/visit-slots/${id}`, data);
    return response.data;
  },

  // Supprimer un créneau
  delete: async (id) => {
    const response = await api.delete(`/visit-slots/${id}`);
    return response.data;
  },

  // Réserver un créneau (client)
  book: async (id, data = {}) => {
    const response = await api.post(`/visit-slots/${id}/book`, data);
    return response.data;
  },

  // Annuler une réservation
  cancel: async (id) => {
    const response = await api.post(`/visit-slots/${id}/cancel`);
    return response.data;
  },

  // Marquer comme complété
  complete: async (id) => {
    const response = await api.post(`/visit-slots/${id}/complete`);
    return response.data;
  },
};

export default visitSlotsAPI;
