/**
 * Gestion des abonnements et paiements - VERSION PRODUCTION
 * Utilise le backend via Fedapay
 */

import api from '../api/axios';
import { getCurrentUser } from './auth';

/**
 * Créer un paiement pour abonnement PRO
 * @param {number} duration - Durée en jours (30 ou 90)
 * @returns {Promise<Object>} Retourne l'URL de paiement Fedapay
 */
export const createSubscriptionPayment = async (duration = 30) => {
  try {
    const response = await api.post('/payments/create-subscription', { duration });
    return response.data;
  } catch (error) {
    console.error('Erreur création paiement:', error);
    throw error;
  }
};

/**
 * Créer un paiement pour booster une annonce
 * @param {string|number} listingId
 * @returns {Promise<Object>}
 */
export const createBoostPayment = async (listingId) => {
  try {
    const response = await api.post('/payments/boost-listing', { listing_id: listingId });
    return response.data;
  } catch (error) {
    console.error('Erreur création paiement boost:', error);
    throw error;
  }
};

/**
 * Vérifier le statut d'un paiement
 * @param {string|number} paymentId
 * @returns {Promise<Object>}
 */
export const checkPaymentStatus = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}/status`);
    return response.data.payment;
  } catch (error) {
    console.error('Erreur vérification paiement:', error);
    throw error;
  }
};

/**
 * Récupérer l'historique des paiements
 * @returns {Promise<Array>}
 */
export const getPaymentHistory = async () => {
  try {
    const response = await api.get('/payments/history');
    return response.data.payments || [];
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    return [];
  }
};

/**
 * Vérifier si l'abonnement est actif
 * Note: Cette info vient du profil utilisateur (GET /api/v1/auth/me)
 * @param {Object} user - Utilisateur
 * @returns {boolean}
 */
export const isSubscriptionActive = (user) => {
  if (!user) return false;
  if (user.isPro) return true;
  if (user.accountType === 'PRO') return true;
  
  // Vérifier la date d'expiration
  if (user.subscriptionExpiresAt) {
    const expirationDate = new Date(user.subscriptionExpiresAt);
    return expirationDate > new Date();
  }
  
  return false;
};

/**
 * Obtenir le nombre de jours restants de l'abonnement
 * @param {Object} user - Utilisateur
 * @returns {number}
 */
export const getDaysRemaining = (user) => {
  if (!user || !user.subscriptionExpiresAt) return 0;
  
  const expirationDate = new Date(user.subscriptionExpiresAt);
  const today = new Date();
  const diffTime = expirationDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};

/**
 * Obtenir le statut de l'abonnement
 * @param {Object} user - Utilisateur
 * @returns {Object}
 */
export const getSubscriptionStatus = (user) => {
  const isActive = isSubscriptionActive(user);
  const daysRemaining = getDaysRemaining(user);
  
  return {
    isActive,
    isPro: user?.isPro || false,
    accountType: user?.accountType || 'FREE',
    expiresAt: user?.subscriptionExpiresAt || null,
    daysRemaining
  };
};

/**
 * Initialiser l'abonnement (appeler au démarrage de l'app)
 * @returns {Promise<void>}
 */
export const initializeSubscription = async () => {
  try {
    const user = await getCurrentUser();
    if (user) {
      return getSubscriptionStatus(user);
    }
    return null;
  } catch (error) {
    console.error('Erreur initialisation abonnement:', error);
    return null;
  }
};

/**
 * Obtenir l'abonnement de l'utilisateur
 * @returns {Promise<Object|null>}
 */
export const getSubscription = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    return getSubscriptionStatus(user);
  } catch (error) {
    console.error('Erreur récupération abonnement:', error);
    return null;
  }
};

/**
 * Vérifier si l'utilisateur peut renouveler son abonnement
 * @param {Object} user - Utilisateur
 * @returns {boolean}
 */
export const canRenewSubscription = (user) => {
  if (!user) return false;
  // On peut renouveler si on est PRO ou si l'abonnement expire bientôt (< 7 jours)
  const daysRemaining = getDaysRemaining(user);
  return user.isPro || daysRemaining < 7;
};

/**
 * Formater la date d'expiration
 * @param {string|Date} date
 * @returns {string}
 */
export const formatEndDate = (date) => {
  if (!date) return 'Non défini';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Mettre à jour le statut de l'abonnement
 * @param {string} status - Nouveau statut
 * @returns {Promise<Object>}
 */
export const updateSubscriptionStatus = async (status) => {
  try {
    const response = await api.put('/users/subscription', { status });
    return response.data;
  } catch (error) {
    console.error('Erreur mise à jour abonnement:', error);
    throw error;
  }
};

/**
 * Créer un abonnement (après paiement réussi)
 * @param {Object} paymentData - Données du paiement
 * @returns {Promise<Object>}
 */
export const createSubscription = async (paymentData) => {
  try {
    const response = await api.post('/subscriptions', paymentData);
    return response.data;
  } catch (error) {
    console.error('Erreur création abonnement:', error);
    throw error;
  }
};
