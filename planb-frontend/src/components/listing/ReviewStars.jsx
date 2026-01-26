import { Star } from 'lucide-react';

/**
 * Composant pour afficher les étoiles de notation
 */
export default function ReviewStars({ 
  rating = 0, 
  size = 16, 
  interactive = false,
  onChange = null,
  className = ''
}) {
  const stars = [1, 2, 3, 4, 5];

  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {stars.map((star) => (
        <button
          key={star}
          onClick={() => handleClick(star)}
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          type="button"
        >
          <Star
            size={size}
            className={`${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-300'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}
