/**
 * Carte skeleton pour le chargement des annonces
 */
export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-secondary-100 animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-[4/3] bg-secondary-200" />
      
      {/* Contenu */}
      <div className="p-3 space-y-2">
        {/* Titre */}
        <div className="h-4 bg-secondary-200 rounded w-3/4" />
        
        {/* Prix */}
        <div className="h-5 bg-secondary-200 rounded w-1/2" />
        
        {/* Localisation */}
        <div className="h-3 bg-secondary-100 rounded w-2/3" />
      </div>
    </div>
  );
}
