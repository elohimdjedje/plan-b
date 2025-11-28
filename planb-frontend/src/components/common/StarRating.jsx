import { Star } from 'lucide-react';

/**
 * Composant d'affichage de note en étoiles
 * @param {number} rating - Note sur 5
 * @param {number} count - Nombre d'avis (optionnel)
 * @param {string} size - Taille des étoiles (sm, md, lg)
 * @param {boolean} showCount - Afficher le nombre d'avis
 */
export default function StarRating({ 
  rating = 0, 
  count = 0, 
  size = 'md',
  showCount = true 
}) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const starSize = sizeClasses[size] || sizeClasses.md;
  const textSize = textSizeClasses[size] || textSizeClasses.md;

  // Arrondir à 0.5 près
  const roundedRating = Math.round(rating * 2) / 2;

  return (
    <div className="flex items-center gap-1">
      {/* Étoiles */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= roundedRating;
          const halfFilled = star === Math.ceil(roundedRating) && roundedRating % 1 !== 0;

          return (
            <div key={star} className="relative">
              {halfFilled ? (
                <>
                  {/* Étoile vide en arrière-plan */}
                  <Star className={`${starSize} text-gray-300`} fill="currentColor" />
                  {/* Étoile pleine (moitié) */}
                  <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
                    <Star className={`${starSize} text-yellow-400`} fill="currentColor" />
                  </div>
                </>
              ) : (
                <Star 
                  className={`${starSize} ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Note et nombre d'avis */}
      <div className={`${textSize} text-secondary-600 font-medium flex items-center gap-1`}>
        <span className="font-semibold text-secondary-900">{rating.toFixed(1)}</span>
        {showCount && count > 0 && (
          <span className="text-secondary-500">({count})</span>
        )}
      </div>
    </div>
  );
}
