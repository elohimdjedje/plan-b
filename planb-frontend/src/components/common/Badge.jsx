/**
 * Composant Badge pour afficher des étiquettes
 */
export default function Badge({ 
  children, 
  variant = 'primary',
  size = 'md',
  className = '' 
}) {
  const variants = {
    primary: 'bg-primary-500 text-white',
    secondary: 'bg-secondary-200 text-secondary-900',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-500 text-white',
    pro: 'bg-yellow-400 text-yellow-900',
    featured: 'bg-orange-500 text-white',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-semibold rounded-lg
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
