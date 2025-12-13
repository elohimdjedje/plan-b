import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { SearchX, ArrowRight, LayoutGrid } from 'lucide-react';
import MobileContainer from '../components/layout/MobileContainer';
import FilterBar from '../components/listing/FilterBar';
import CategoryTabs from '../components/listing/CategoryTabs';
import SubcategoryMenu from '../components/listing/SubcategoryMenu';
import ListingCard from '../components/listing/ListingCard';
import RecentSearches from '../components/listing/RecentSearches';
import TopProListings from '../components/listing/TopProListings';
import RecentListings from '../components/listing/RecentListings';
import CategoryListingsCarousel from '../components/listing/CategoryListingsCarousel';
import SkeletonCard from '../components/listing/SkeletonCard';
import { listingsAPI } from '../api/listings';

/**
 * Page d'accueil avec liste d'annonces et filtres
 */
export default function Home() {
  const location = useLocation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState('');
  const [filters, setFilters] = useState({});
  const [recentSearches, setRecentSearches] = useState([]);
  const [scrollY, setScrollY] = useState(0);

  // Effet de scroll pour le parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculer les valeurs de transition basées sur le scroll
  const maxScroll = 150; // Distance de scroll pour l'effet complet
  const scrollProgress = Math.min(scrollY / maxScroll, 1);
  const heroOpacity = 1 - scrollProgress;
  const heroScale = 1 + (scrollProgress * 0.1);
  const heroTranslateY = scrollY * 0.5;


  // Réinitialiser les filtres quand on clique sur Accueil
  useEffect(() => {
    // Si on arrive sur "/" depuis la navigation, réinitialiser
    if (location.pathname === '/' && location.state?.fromNav) {
      setActiveCategory('all');
      setActiveSubcategory('');
      setFilters({});
    }
  }, [location]);

  // Charger les recherches récentes depuis localStorage au montage
  useEffect(() => {
    const savedSearches = localStorage.getItem('planb_recent_searches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (error) {
        console.error('Erreur lors du chargement des recherches récentes:', error);
        setRecentSearches([]);
      }
    } else {
      // Aucune recherche sauvegardée = nouvel utilisateur
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    // Toujours afficher le loader lors d'un changement de catégorie
    setLoading(true);

    // Charger immédiatement (le cache gère la déduplication)
    loadListings();
  }, [activeCategory, activeSubcategory, filters]);

  const loadListings = async () => {
    try {

      // Construire les paramètres de requête
      const params = {};

      // Filtrer par catégorie
      if (activeCategory && activeCategory !== 'all') {
        params.category = activeCategory;
      }

      // Filtrer par sous-catégorie
      if (activeSubcategory) {
        params.subcategory = activeSubcategory;
      }

      // Appliquer les autres filtres
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }
      if (filters.type) {
        params.type = filters.type;
      }
      if (filters.priceMin) {
        params.minPrice = filters.priceMin;
      }
      if (filters.priceMax) {
        params.maxPrice = filters.priceMax;
      }
      if (filters.country) {
        params.country = filters.country;
      }
      if (filters.city) {
        params.city = filters.city;
      }
      if (filters.commune) {
        params.commune = filters.commune;
      }

      // Charger les annonces depuis l'API backend
      const response = await listingsAPI.getListings(params);
      const allListings = response.data || [];

      setListings(allListings);
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
      // Ne pas afficher de toast si c'est juste qu'il n'y a pas d'annonces
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);

    // Sauvegarder la recherche si des filtres sont appliqués
    if (Object.keys(newFilters).some(key => newFilters[key] &&
      (Array.isArray(newFilters[key]) ? newFilters[key].length > 0 : true))) {

      // Générer un label automatique
      const generateLabel = () => {
        const parts = [];

        if (newFilters.type === 'location') parts.push('Locations');
        else if (newFilters.type === 'vente') parts.push('Ventes');

        if (newFilters.propertyTypes?.length > 0) {
          parts.push(newFilters.propertyTypes[0]);
        }

        if (newFilters.vehicleType) {
          parts.push(newFilters.vehicleType);
        }

        if (newFilters.accommodationType) {
          parts.push(newFilters.accommodationType);
        }

        if (newFilters.city) {
          parts.push(newFilters.city);
        }

        return parts.length > 0 ? parts.join(' ') : 'Recherche';
      };

      // Déterminer l'icône selon la catégorie
      const getIcon = () => {
        if (activeCategory === 'immobilier') return 'Home';
        if (activeCategory === 'vehicule') return 'Car';
        if (activeCategory === 'vacance') return 'Palmtree';
        return 'Search';
      };

      // Sauvegarder la recherche
      saveSearchToHistory({
        icon: getIcon(),
        label: generateLabel(),
        filters: {
          ...newFilters,
          category: activeCategory
        }
      });
    }
  };

  // Sauvegarder une recherche dans l'historique
  const saveSearchToHistory = (searchData) => {
    const searches = [...recentSearches];

    // Vérifier si la recherche existe déjà
    const existingIndex = searches.findIndex(s =>
      JSON.stringify(s.filters) === JSON.stringify(searchData.filters)
    );

    // Si elle existe, la supprimer pour la remettre en premier
    if (existingIndex !== -1) {
      searches.splice(existingIndex, 1);
    }

    // Ajouter en premier
    searches.unshift(searchData);

    // Limiter à 5 recherches maximum
    const limitedSearches = searches.slice(0, 5);

    // Sauvegarder dans localStorage et state
    localStorage.setItem('planb_recent_searches', JSON.stringify(limitedSearches));
    setRecentSearches(limitedSearches);
  };

  // Gérer le clic sur une recherche récente
  const handleSearchClick = (search) => {
    // Appliquer les filtres de la recherche
    if (search.filters) {
      // Changer la catégorie si nécessaire
      if (search.filters.category) {
        setActiveCategory(search.filters.category);
      }

      // Appliquer tous les autres filtres
      const newFilters = { ...search.filters };
      delete newFilters.category; // On enlève category car déjà géré
      setFilters(newFilters);

      // Scroll vers les résultats (optionnel)
      setTimeout(() => {
        const resultsSection = document.querySelector('[data-results]');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  };

  return (
    <MobileContainer headerProps={{ transparent: true, scrollProgress, showLogo: false }}>
      {/* Image de fond hero avec effet parallax */}
      <div
        className="fixed top-0 left-0 right-0 h-[280px] md:h-[320px] -z-10 overflow-hidden transition-opacity duration-100"
        style={{
          opacity: heroOpacity,
          transform: `translateY(-${heroTranslateY}px) scale(${heroScale})`,
        }}
      >
        {/* Image nette */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/hero-houses.jpg)',
          }}
        />
        {/* Overlay léger */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-transparent" />
        {/* Dégradé vers le fond - plus bas pour voir plus d'image */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-sky-100 to-transparent" />
      </div>

      <div className="space-y-4 md:space-y-6 lg:space-y-8">
        {/* Barre de recherche - devient sticky au scroll */}
        <FilterBar
          onFilter={handleFilter}
          currentFilters={filters}
          activeCategory={activeCategory}
          scrollY={scrollY}
          onSearch={(searchQuery) => {
            // Appliquer le filtre de recherche
            setFilters({ ...filters, search: searchQuery });

            // Scroller vers les résultats
            setTimeout(() => {
              const resultsSection = document.querySelector('[data-results]') ||
                document.querySelector('.grid.grid-cols-2');
              if (resultsSection) {
                const offset = 100;
                const elementPosition = resultsSection.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth'
                });
              }
            }, 100);
          }}
        />

        {/* Icônes de catégories circulaires (style Le Bon Coin) */}
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Menu déroulant sous-catégories */}
        <SubcategoryMenu
          activeCategory={activeCategory}
          activeSubcategory={activeSubcategory}
          onSubcategoryChange={setActiveSubcategory}
        />

        {/* Section Top Annonces PRO - filtrées par catégorie */}
        <TopProListings activeCategory={activeCategory} />

        {/* Section Annonces Récentes - Tous profils pendant 3 jours */}
        <RecentListings activeCategory={activeCategory} />

        {/* Section "Recherches récentes" - Desktop seulement */}
        <div className="hidden md:block">
          <RecentSearches
            title="Recherches récentes"
            searches={recentSearches}
            onSearchClick={handleSearchClick}
          />
        </div>

        {/* Séparateur stylé + Titre section annonces */}
        <div className="relative py-2">
          {/* Ligne dégradée */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-secondary-300 to-transparent" />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg">
            <LayoutGrid size={18} className="text-white" />
          </div>
          <h2 className="text-base md:text-lg font-bold text-secondary-900">
            {activeCategory === 'all' ? 'Toutes les annonces' :
              activeCategory === 'immobilier' ? 'Immobilier' :
                activeCategory === 'vehicule' ? 'Véhicules' :
                  activeCategory === 'emploi' ? 'Emploi & Services' :
                    activeCategory === 'mode' ? 'Mode' :
                      activeCategory === 'electronique' ? 'Électronique' :
                        activeCategory === 'maison' ? 'Maison' :
                          activeCategory === 'loisirs' ? 'Loisirs' :
                            activeCategory === 'vacance' ? 'Vacances' : 'Annonces'}
          </h2>
        </div>

        {/* Affichage des annonces */}
        {loading ? (
          <>
            {/* Mobile: Skeleton Grid */}
            <div className="md:hidden">
              <div className="grid grid-cols-2 gap-2 pb-24">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
            {/* Desktop: Skeleton Grid */}
            <div className="hidden md:grid grid-cols-4 gap-4 pb-24">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </>
        ) : listings.length > 0 ? (
          <>
            {/* Mobile: Grille simple 2 colonnes avec effet vague cascade */}
            <div className="md:hidden">
              <div className="grid grid-cols-2 gap-2 pb-24">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>

            {/* Desktop: Mode carrousel par catégorie (quand pas de filtre actif) */}
            <div className="hidden md:block">
              {/* Séparateur desktop */}
              <div className="relative py-3 mb-4">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-secondary-300 to-transparent" />
              </div>

              {activeCategory === 'all' && !Object.keys(filters).some(k => filters[k]) ? (
                <div className="space-y-8 pb-24">
                  {/* Carrousel Immobilier */}
                  {listings.filter(l => l.category === 'immobilier').length > 0 && (
                    <CategoryListingsCarousel
                      title="Immobilier"
                      listings={listings.filter(l => l.category === 'immobilier').slice(0, 10)}
                      category="immobilier"
                      onViewMore={() => setActiveCategory('immobilier')}
                    />
                  )}

                  {/* Carrousel Véhicules */}
                  {listings.filter(l => l.category === 'vehicule').length > 0 && (
                    <CategoryListingsCarousel
                      title="Véhicules"
                      listings={listings.filter(l => l.category === 'vehicule').slice(0, 10)}
                      category="vehicule"
                      onViewMore={() => setActiveCategory('vehicule')}
                    />
                  )}

                  {/* Carrousel Vacances */}
                  {listings.filter(l => l.category === 'vacance').length > 0 && (
                    <CategoryListingsCarousel
                      title="Vacances"
                      listings={listings.filter(l => l.category === 'vacance').slice(0, 10)}
                      category="vacance"
                      onViewMore={() => setActiveCategory('vacance')}
                    />
                  )}
                </div>
              ) : (
                /* Mode grille (quand filtre actif) avec effet vague cascade */
                <div data-results className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-24">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : !loading && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-2">
              <SearchX size={40} className="text-gray-300" />
            </div>
            <p className="text-secondary-600">Aucune annonce trouvée</p>
            <p className="text-sm text-secondary-500 mt-1">
              Essayez de modifier vos filtres
            </p>
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
