/**
 * API Admin - Endpoints pour le dashboard administrateur
 */
import api from './axios';

export const adminAPI = {
  // ==================== DASHBOARD ====================
  
  /**
   * Récupérer les statistiques globales du dashboard
   */
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // ==================== UTILISATEURS ====================
  
  /**
   * Liste des utilisateurs avec pagination et filtres
   */
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  /**
   * Détails d'un utilisateur
   */
  getUserDetail: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Activer le PRO pour un utilisateur
   */
  activatePro: async (userId, months = 1) => {
    const response = await api.put(`/admin/users/${userId}/activate-pro`, { months });
    return response.data;
  },

  /**
   * Désactiver le PRO d'un utilisateur
   */
  deactivatePro: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/deactivate-pro`);
    return response.data;
  },

  /**
   * Mettre un utilisateur en PRO illimité
   */
  setLifetimePro: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/lifetime-pro`);
    return response.data;
  },

  /**
   * Retirer le PRO illimité
   */
  removeLifetimePro: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/remove-lifetime-pro`);
    return response.data;
  },

  // ==================== PAIEMENTS ====================
  
  /**
   * Liste de tous les paiements
   */
  getAllPayments: async (params = {}) => {
    const response = await api.get('/admin/payments', { params });
    return response.data;
  },

  /**
   * Paiements en attente de vérification
   */
  getPendingPayments: async () => {
    const response = await api.get('/admin/payments/pending');
    return response.data;
  },

  /**
   * Confirmer un paiement et activer le PRO
   */
  confirmPayment: async (paymentId) => {
    const response = await api.put(`/admin/payments/${paymentId}/confirm`);
    return response.data;
  },

  /**
   * Rejeter un paiement
   */
  rejectPayment: async (paymentId, reason = '') => {
    const response = await api.put(`/admin/payments/${paymentId}/reject`, { reason });
    return response.data;
  },

  /**
   * Demandes de paiement avec preuves
   */
  getPaymentRequests: async () => {
    const response = await api.get('/admin/payment-requests');
    return response.data;
  },

  // ==================== ANNONCES ====================
  
  /**
   * Liste des annonces avec filtres
   */
  getListings: async (params = {}) => {
    const response = await api.get('/admin/listings', { params });
    return response.data;
  },

  /**
   * Supprimer une annonce (modération)
   */
  deleteListing: async (listingId) => {
    const response = await api.delete(`/admin/listings/${listingId}`);
    return response.data;
  },

  // ==================== REVENUS ====================
  
  /**
   * Revenus totaux
   */
  getRevenues: async () => {
    const response = await api.get('/admin/revenues');
    return response.data;
  },

  /**
   * Revenus mensuels
   */
  getMonthlyRevenues: async () => {
    const response = await api.get('/admin/revenues/monthly');
    return response.data;
  },

  // ==================== STATISTIQUES ====================
  
  /**
   * Statistiques de croissance
   */
  getGrowthStats: async () => {
    const response = await api.get('/admin/stats/growth');
    return response.data;
  },

  // ==================== AUDIT ====================
  
  /**
   * Audit complet
   */
  getAudit: async () => {
    const response = await api.get('/admin/audit');
    return response.data;
  },

  /**
   * Résumé audit
   */
  getAuditSummary: async () => {
    const response = await api.get('/admin/audit/summary');
    return response.data;
  }
};

export default adminAPI;
