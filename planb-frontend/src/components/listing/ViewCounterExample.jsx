import ViewCounter, { ViewCounterCompact, ViewStats } from './ViewCounter';

/**
 * 🎓 EXEMPLES D'UTILISATION DU COMPTEUR DE VUES
 * 
 * Ce fichier montre toutes les façons d'utiliser le composant ViewCounter
 */

// ============================================================
// EXEMPLE 1 : Utilisation Simple
// ============================================================
export function Example1_Simple() {
  const listing = { views: 1234 };
  
  return (
    <div>
      <h2>Mon Annonce</h2>
      <ViewCounter views={listing.views} />
    </div>
  );
}

// ============================================================
// EXEMPLE 2 : Avec Animation
// ============================================================
export function Example2_Animated() {
  const listing = { views: 5000 };
  
  return (
    <div>
      <h2>Mon Annonce</h2>
      <ViewCounter views={listing.views} animated={true} />
    </div>
  );
}

// ============================================================
// EXEMPLE 3 : Version Compacte (pour cartes)
// ============================================================
export function Example3_Compact() {
  const listing = { views: 250 };
  
  return (
    <div className="card">
      <img src={listing.image} alt="" />
      <h3>{listing.title}</h3>
      <div className="flex items-center gap-2">
        <ViewCounterCompact views={listing.views} />
        <span className="text-sm">•</span>
        <span className="text-sm">{listing.city}</span>
      </div>
    </div>
  );
}

// ============================================================
// EXEMPLE 4 : Avec Badge "Hot"
// ============================================================
export function Example4_WithBadge() {
  const listing = { views: 10000 }; // >= 1000 vues
  
  return (
    <div>
      <h2>Annonce Populaire</h2>
      {/* Badge "Hot" apparaît automatiquement */}
      <ViewCounter views={listing.views} animated={true} />
    </div>
  );
}

// ============================================================
// EXEMPLE 5 : Statistiques Détaillées
// ============================================================
export function Example5_Stats() {
  const stats = {
    total: 5432,
    last24h: 120,
    last7days: 850
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-semibold mb-3">Statistiques de vues</h3>
      <ViewStats 
        total={stats.total}
        last24h={stats.last24h}
        last7days={stats.last7days}
      />
    </div>
  );
}

// ============================================================
// EXEMPLE 6 : Dans une Liste d'Annonces
// ============================================================
export function Example6_InList() {
  const listings = [
    { id: 1, title: "Appartement", views: 1200 },
    { id: 2, title: "Villa", views: 5600 },
    { id: 3, title: "Studio", views: 340 }
  ];
  
  return (
    <div className="space-y-4">
      {listings.map(listing => (
        <div key={listing.id} className="flex items-center justify-between p-4 bg-white rounded-lg">
          <h3>{listing.title}</h3>
          <ViewCounterCompact views={listing.views} />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// EXEMPLE 7 : Avec Conditions
// ============================================================
export function Example7_Conditional() {
  const listing = { views: 15000 };
  const isPopular = listing.views >= 1000;
  
  return (
    <div>
      <h2>Mon Annonce</h2>
      
      {/* Afficher seulement si > 0 vues */}
      {listing.views > 0 && (
        <ViewCounter views={listing.views} />
      )}
      
      {/* Message pour annonces populaires */}
      {isPopular && (
        <div className="mt-2 text-sm text-orange-600">
          Cette annonce est très consultée ! 🔥
        </div>
      )}
    </div>
  );
}

// ============================================================
// EXEMPLE 8 : Dans un Dashboard Vendeur
// ============================================================
export function Example8_Dashboard() {
  const myListings = [
    { id: 1, title: "Appartement Centre-ville", views: 2340, last24h: 45, last7days: 320 },
    { id: 2, title: "Villa avec Piscine", views: 5670, last24h: 89, last7days: 650 },
    { id: 3, title: "Studio Meublé", views: 890, last24h: 12, last7days: 120 }
  ];
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mes Annonces</h2>
      
      {myListings.map(listing => (
        <div key={listing.id} className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">{listing.title}</h3>
          <ViewStats 
            total={listing.views}
            last24h={listing.last24h}
            last7days={listing.last7days}
          />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// EXEMPLE 9 : Formatage Personnalisé
// ============================================================
export function Example9_CustomFormatting() {
  const views = 123456;
  
  // Le formatage se fait automatiquement
  // 123456 → "123.5k"
  
  return (
    <div>
      <ViewCounter views={views} />
      {/* Affiche: 👁️ 123.5k */}
    </div>
  );
}

// ============================================================
// EXEMPLE 10 : Intégration Complète
// ============================================================
export function Example10_FullIntegration() {
  const listing = {
    id: 1,
    title: "Belle Villa à Abidjan",
    price: 85000000,
    views: 3450,
    city: "Cocody",
    createdAt: "2024-11-10"
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header avec stats */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{listing.title}</h1>
        <ViewCounter views={listing.views} animated={true} />
      </div>
      
      {/* Prix */}
      <div className="text-2xl font-bold text-primary-600 mb-4">
        {listing.price.toLocaleString()} FCFA
      </div>
      
      {/* Infos */}
      <div className="flex items-center gap-4 text-gray-600">
        <span>📍 {listing.city}</span>
        <span>•</span>
        <span>🕐 {new Date(listing.createdAt).toLocaleDateString()}</span>
      </div>
      
      {/* Message si populaire */}
      {listing.views >= 1000 && (
        <div className="mt-4 p-3 bg-orange-50 rounded-lg">
          <p className="text-orange-700 font-medium">
            🔥 Annonce très consultée ! Ne manquez pas cette opportunité
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// EXPORT PAR DÉFAUT (pour démo)
// ============================================================
export default function ViewCounterExamples() {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <h1 className="text-4xl font-bold text-center mb-12">
        Exemples d'Utilisation du Compteur de Vues
      </h1>
      
      <div className="space-y-12">
        <section className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">1. Simple</h2>
          <Example1_Simple />
        </section>
        
        <section className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">2. Avec Animation</h2>
          <Example2_Animated />
        </section>
        
        <section className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">3. Version Compacte</h2>
          <Example3_Compact />
        </section>
        
        <section className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">4. Avec Badge Hot</h2>
          <Example4_WithBadge />
        </section>
        
        <section className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">5. Statistiques</h2>
          <Example5_Stats />
        </section>
        
        <section className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">10. Intégration Complète</h2>
          <Example10_FullIntegration />
        </section>
      </div>
    </div>
  );
}
