/**
 * Carte skeleton pour le chargement des annonces
 * Animation de shimmer avec spinner pour un effet de chargement visible
 */
export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-secondary-200 shadow-sm">
      {/* Image placeholder avec spinner */}
      <div className="relative aspect-[4/3] bg-gradient-to-r from-secondary-200 via-secondary-100 to-secondary-200 animate-shimmer" style={{ backgroundSize: '200% 100%' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-secondary-300 border-t-primary-500 rounded-full animate-spin" />
        </div>
      </div>
      
      {/* Contenu */}
      <div className="p-3 space-y-2">
        {/* Titre */}
        <div className="h-4 bg-gradient-to-r from-secondary-200 via-secondary-100 to-secondary-200 rounded w-3/4 animate-pulse" />
        
        {/* Prix */}
        <div className="h-5 bg-gradient-to-r from-primary-200 via-primary-100 to-primary-200 rounded w-1/2 animate-pulse" />
        
        {/* Localisation */}
        <div className="h-3 bg-gradient-to-r from-secondary-200 via-secondary-100 to-secondary-200 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  );
}
