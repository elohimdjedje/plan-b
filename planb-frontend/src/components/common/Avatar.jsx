import { getInitials } from '../../utils/format';

/**
 * Composant Avatar avec fallback sur initiales
 */
export default function Avatar({ 
  src, 
  alt, 
  name,
  size = 'md',
  className = '' 
}) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={`
          rounded-full object-cover
          ${sizes[size]}
          ${className}
        `}
      />
    );
  }

  return (
    <div
      className={`
        rounded-full bg-gradient-to-br from-primary-400 to-primary-600
        flex items-center justify-center
        font-bold text-white
        ${sizes[size]}
        ${className}
      `}
    >
      {getInitials(name || alt || '?')}
    </div>
  );
}
