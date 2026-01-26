import { useState, useEffect, useCallback } from 'react';
import favoritesApi from '../api/favorites';
import { toast } from 'react-hot-toast';

/**
 * Hook pour gérer les favoris
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer tous les favoris
  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await favoritesApi.getAll();
      setFavorites(data.favorites || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  // Ajouter aux favoris
  const addFavorite = useCallback(async (listingId) => {
    try {
      await favoritesApi.add(listingId);
      toast.success('Ajouté aux favoris');
      await fetchFavorites();
      return true;
    } catch (err) {
      console.error('Error adding favorite:', err);
      const errorMsg = err.response?.data?.error || 'Impossible d\'ajouter aux favoris';
      toast.error(errorMsg);
      return false;
    }
  }, [fetchFavorites]);

  // Retirer des favoris
  const removeFavorite = useCallback(async (listingId) => {
    try {
      await favoritesApi.remove(listingId);
      toast.success('Retiré des favoris');
      await fetchFavorites();
      return true;
    } catch (err) {
      console.error('Error removing favorite:', err);
      const errorMsg = err.response?.data?.error || 'Impossible de retirer des favoris';
      toast.error(errorMsg);
      return false;
    }
  }, [fetchFavorites]);

  // Toggle favori (ajouter ou retirer)
  const toggleFavorite = useCallback(async (listingId, isFavorite) => {
    if (isFavorite) {
      return await removeFavorite(listingId);
    } else {
      return await addFavorite(listingId);
    }
  }, [addFavorite, removeFavorite]);

  // Vérifier si une annonce est en favoris
  const isFavorite = useCallback((listingId) => {
    return favorites.some(fav => fav.listing?.id === listingId);
  }, [favorites]);

  // Charger les favoris au montage
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refresh: fetchFavorites,
  };
};

export default useFavorites;
