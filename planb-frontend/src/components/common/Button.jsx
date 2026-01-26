/**
 * Bouton réutilisable avec différentes variantes
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  icon,
  className = '',
}) {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md';
  
  const variants = {
    primary: 'bg-primary-500/80 hover:bg-primary-600/90 text-white shadow-lg hover:shadow-xl border border-white/20',
    secondary: 'bg-white/60 hover:bg-white/80 text-secondary-900 border border-white/40 shadow-md',
    success: 'bg-success-500/80 hover:bg-success-600/90 text-white shadow-lg border border-white/20',
    outline: 'border-2 border-primary-500/60 text-primary-600 hover:bg-primary-500/10 backdrop-blur-lg',
    ghost: 'text-primary-600 hover:bg-white/40 backdrop-blur-sm',
    danger: 'bg-red-500/80 hover:bg-red-600/90 text-white border border-white/20',
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${widthClass}
        ${className}
      `}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : icon ? (
        <>
          {icon}
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
