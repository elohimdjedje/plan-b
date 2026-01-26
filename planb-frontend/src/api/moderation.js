/**
 * API Moderation - Administration (ROLE_ADMIN uniquement)
 */
import api from './axios';

export const moderationAPI = {
  /**
   * Signalements en attente
   */
  getPendingReports: async (params = {}) => {
    const response = await api.get('/api/v1/moderation/reports/pending', { params });
    return response.data;
  },

  /**
   * Détail d'un signalement
   */
  getReportDetail: async (reportId) => {
    const response = await api.get(`/api/v1/moderation/reports/${reportId}`);
    return response.data;
  },

  /**
   * Traiter un signalement
   */
  processReport: async (reportId, action, reason, notes = null) => {
    const response = await api.post(`/api/v1/moderation/reports/${reportId}/process`, {
      action, // hide, delete, warn, ban, approve
      reason,
      notes,
    });
    return response.data;
  },

  /**
   * Masquer une annonce
   */
  hideListing: async (listingId, reason) => {
    const response = await api.post(`/api/v1/moderation/listings/${listingId}/hide`, { reason });
    return response.data;
  },

  /**
   * Supprimer une annonce
   */
  deleteListing: async (listingId, reason) => {
    const response = await api.post(`/api/v1/moderation/listings/${listingId}/delete`, { reason });
    return response.data;
  },

  /**
   * Avertir un utilisateur
   */
  warnUser: async (userId, reason) => {
    const response = await api.post(`/api/v1/moderation/users/${userId}/warn`, { reason });
    return response.data;
  },

  /**
   * Suspendre un utilisateur
   */
  suspendUser: async (userId, reason, days = 7) => {
    const response = await api.post(`/api/v1/moderation/users/${userId}/suspend`, { reason, days });
    return response.data;
  },

  /**
   * Bannir un utilisateur
   */
  banUser: async (userId, reason, days = null) => {
    const response = await api.post(`/api/v1/moderation/users/${userId}/ban`, { reason, days });
    return response.data;
  },

  /**
   * Débannir un utilisateur
   */
  unbanUser: async (userId, reason) => {
    const response = await api.post(`/api/v1/moderation/users/${userId}/unban`, { reason });
    return response.data;
  },

  /**
   * Historique de modération d'un utilisateur
   */
  getUserHistory: async (userId) => {
    const response = await api.get(`/api/v1/moderation/users/${userId}/history`);
    return response.data;
  },

  /**
   * Statistiques de modération
   */
  getStats: async () => {
    const response = await api.get('/api/v1/moderation/stats');
    return response.data;
  },
};


