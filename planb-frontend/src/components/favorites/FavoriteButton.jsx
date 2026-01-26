import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import favoritesApi from '../../api/favorites';
import { toast } from 'react-hot-toast';

/**
 * Bouton favori avec animation de cœur
 * Peut être utilisé standalone (sans hook global)
 */
const FavoriteButton = ({ 
  listingId, 
  initialIsFavorite = false,
  size = 'default',
  variant = 'default',
  onToggle,
  showToast = true,
}) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Vérifier le statut au montage
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const result = await favoritesApi.check(listingId);
        setIsFavorite(result.isFavorite);
      } catch (err) {
        console.error('Error checking favorite:', err);
      } finally {
        setChecking(false);
      }
    };

    checkFavorite();
  }, [listingId]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    try {
      setLoading(true);
      
      if (isFavorite) {
        await favoritesApi.remove(listingId);
        setIsFavorite(false);
        if (showToast) toast.success('Retiré des favoris');
        onToggle?.(false);
      } else {
        await favoritesApi.add(listingId);
        setIsFavorite(true);
        if (showToast) toast.success('Ajouté aux favoris');
        onToggle?.(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      const errorMsg = err.response?.data?.error || 'Erreur lors de la modification';
      if (showToast) toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Tailles
  const sizes = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-12 h-12',
  };

  const iconSizes = {
    small: 16,
    default: 20,
    large: 24,
  };

  // Variants
  const variants = {
    default: isFavorite
      ? 'bg-red-100 hover:bg-red-200'
      : 'bg-white hover:bg-gray-100',
    outline: isFavorite
      ? 'border-2 border-red-500 bg-red-50 hover:bg-red-100'
      : 'border-2 border-gray-300 bg-white hover:border-red-300 hover:bg-red-50',
    minimal: 'bg-transparent hover:bg-white/20',
  };

  if (checking) {
    return (
      <div className={`${sizes[size]} rounded-full flex items-center justify-center`}>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.button
      onClick={handleToggle}
      disabled={loading}
      whileTap={{ scale: 0.85 }}
      className={`
        ${sizes[size]} 
        ${variants[variant]}
        rounded-full 
        flex items-center justify-center 
        transition-all duration-200
        shadow-md hover:shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        relative
        group
      `}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      {/* Animation de particules lors du clic */}
      {isFavorite && (
        <motion.div
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 rounded-full bg-red-300"
        />
      )}

      {/* Icône cœur */}
      <motion.div
        animate={{
          scale: isFavorite ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 0.3,
        }}
      >
        <Heart
          size={iconSizes[size]}
          className={`
            transition-colors duration-200
            ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600 group-hover:text-red-500'}
          `}
          strokeWidth={2.5}
        />
      </motion.div>

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-full">
          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.button>
  );
};

export default FavoriteButton;
