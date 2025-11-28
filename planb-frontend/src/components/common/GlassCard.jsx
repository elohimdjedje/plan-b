/**
 * Carte avec effet glassmorphism
 */
export default function GlassCard({ 
  children, 
  className = '', 
  onClick,
  hover = false,
  padding = 'p-4'
}) {
  const hoverClasses = hover 
    ? 'hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`
        bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg 
        border border-white/30
        ${padding}
        ${hoverClasses}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
