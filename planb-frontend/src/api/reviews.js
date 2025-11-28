import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * API pour gérer les avis et étoiles
 */

/**
 * Créer un nouvel avis
 */
export const createReview = async (reviewData) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/api/v1/reviews`,
    reviewData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

/**
 * Obtenir les avis d'un vendeur
 */
export const getSellerReviews = async (sellerId, page = 1, limit = 10) => {
  const response = await axios.get(
    `${API_URL}/api/v1/reviews/seller/${sellerId}?page=${page}&limit=${limit}`
  );
  return response.data;
};

/**
 * Obtenir les avis d'une annonce
 */
export const getListingReviews = async (listingId) => {
  const response = await axios.get(
    `${API_URL}/api/v1/reviews/listing/${listingId}`
  );
  return response.data;
};

/**
 * Supprimer un avis
 */
export const deleteReview = async (reviewId) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(
    `${API_URL}/api/v1/reviews/${reviewId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
