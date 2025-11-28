/**
 * Utilitaires d'authentification - VERSION PRODUCTION
 * Utilise le backend via JWT
 */

import api from '../api/axios';

/**
 * Inscription d'un nouvel utilisateur
 * @param {Object} userData - Données utilisateur
 * @returns {Promise<Object>}
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Connexion utilisateur
 * @param {string} email - Email
 * @param {string} password - Mot de passe
 * @returns {Promise<string>} JWT token
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const token = response.data.token;
    const user = response.data.user; // Le backend envoie déjà le user!
    
    // Sauvegarder le token dans localStorage
    localStorage.setItem('token', token);
    
    // Mettre à jour le store Zustand
    if (typeof window !== 'undefined' && window.useAuthStore && user) {
      window.useAuthStore.getState().login(user, token);
    }
    
    return token;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupérer l'utilisateur connecté
 * @returns {Promise<Object|null>}
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    // Si le token est invalide, le supprimer
    localStorage.removeItem('token');
    return null;
  }
};

/**
 * Obtenir le profil utilisateur (alias de getCurrentUser)
 * @returns {Promise<Object|null>}
 */
export const getUserProfile = async () => {
  return await getCurrentUser();
};

/**
 * Vérifier si l'utilisateur est connecté
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Déconnexion
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user'); // Par sécurité
  window.location.href = '/auth';
};

/**
 * Mettre à jour le profil utilisateur
 * @param {Object} updates - Mises à jour
 * @returns {Promise<Object>}
 */
export const updateUserProfile = async (updates) => {
  try {
    const response = await api.put('/users/profile', updates);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Changer le mot de passe
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    await api.put('/users/password', { currentPassword, newPassword });
  } catch (error) {
    throw error;
  }
};

/**
 * Vérifier si l'utilisateur est propriétaire d'une annonce
 * @param {Object} listing - Annonce
 * @param {Object|null} user - Utilisateur (optionnel)
 * @returns {Promise<boolean>}
 */
export const isListingOwner = async (listing, user = null) => {
  if (!listing) return false;
  
  const currentUser = user || await getCurrentUser();
  if (!currentUser?.id) return false;
  
  const listingOwnerId = listing.userId || listing.user?.id;
  return String(listingOwnerId) === String(currentUser.id);
};

/**
 * Supprimer son compte
 * @param {string} password - Mot de passe de confirmation
 * @returns {Promise<void>}
 */
export const deleteAccount = async (password) => {
  try {
    await api.delete('/users/account', { data: { password } });
    logout();
  } catch (error) {
    throw error;
  }
};

/**
 * Vérifier si l'utilisateur est propriétaire d'une annonce (version synchrone)
 * @param {Object} listing - Annonce
 * @param {Object|null} user - Utilisateur
 * @returns {boolean}
 */
export const isListingOwnerSync = (listing, user) => {
  if (!listing || !user?.id) return false;
  const listingOwnerId = listing.userId || listing.user?.id;
  return String(listingOwnerId) === String(user.id);
};

/**
 * Sauvegarder le profil utilisateur (alias de updateUserProfile)
 * @param {Object} updates - Mises à jour
 * @returns {Promise<Object>}
 */
export const saveUserProfile = async (updates) => {
  return await updateUserProfile(updates);
};
