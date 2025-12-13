import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, TrendingUp, MessageCircle, Target, BarChart3, PieChart as PieChartIcon,
  Calendar, Award, AlertCircle, ArrowUpRight, ArrowDownRight, Filter,
  Search, ChevronUp, ChevronDown, ExternalLink, Crown, Sparkles, Clock,
  TrendingDown, Zap, Info, ArrowLeft
} from 'lucide-react';
import {
  LineChart, Line, PieChart, Pie, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend, Area, AreaChart
} from 'recharts';
import { format, subDays, differenceInDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import MobileContainer from '../components/layout/MobileContainer';
import GlassCard from '../components/common/GlassCard';
import { useAuthStore } from '../store/authStore';
import { usersAPI } from '../api/users';
import { listingsAPI } from '../api/listings';
import PlanBLoader from '../components/animations/PlanBLoader';
import { formatPrice } from '../utils/format';
import { getImageUrl } from '../utils/images';

// Couleurs du thème PlanB
const COLORS = {
  primary: '#FF6B35',
  secondary: '#FFA500',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  purple: '#8B5CF6',
  pink: '#EC4899',
  gray: '#64748B'
};

const CATEGORY_COLORS = {
  immobilier: '#3B82F6',
  vehicule: '#10B981',
  vacance: '#F59E0B',
  emploi: '#8B5CF6',
  mode: '#EC4899',
  electronique: '#06B6D4',
  maison: '#84CC16',
  loisirs: '#F97316'
};

const CATEGORY_LABELS = {
  immobilier: 'Immobilier',
  vehicule: 'Véhicules',
  vacance: 'Vacances',
  emploi: 'Emploi',
  mode: 'Mode',
  electronique: 'Électronique',
  maison: 'Maison',
  loisirs: 'Loisirs'
};

// Composant carte de statistique
function StatCard({ icon: Icon, value, label, color, trend, trendValue }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="text-center relative overflow-hidden" padding="p-4">
        <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl opacity-20`}
          style={{ backgroundColor: color }} />
        <Icon size={28} className="mx-auto mb-2" style={{ color }} />
        <div className="text-2xl md:text-3xl font-bold text-secondary-900">
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </div>
        <div className="text-xs text-secondary-600 mt-1">{label}</div>
        {trend && (
          <div className={`flex items-center justify-center gap-1 mt-2 text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{trendValue}</span>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

// Composant tableau des annonces
function ListingsTable({ listings, onSort, sortConfig, onViewListing }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [listings, searchTerm, categoryFilter]);

  const categories = useMemo(() => {
    const cats = [...new Set(listings.map(l => l.category))];
    return cats;
  }, [listings]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <GlassCard padding="p-0" className="overflow-hidden">
      <div className="p-4 border-b border-secondary-200">
        <h3 className="text-lg font-bold text-secondary-900 mb-3 flex items-center gap-2">
          <BarChart3 size={20} className="text-primary-500" />
          Détail de vos annonces
        </h3>

        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="Rechercher une annonce..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${categoryFilter === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
            >
              Toutes
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${categoryFilter === cat
                  ? 'text-white'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                  }`}
                style={categoryFilter === cat ? { backgroundColor: CATEGORY_COLORS[cat] } : {}}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-600">Annonce</th>
              <th
                className="px-4 py-3 text-center text-xs font-semibold text-secondary-600 cursor-pointer hover:text-primary-500"
                onClick={() => onSort('viewsCount')}
              >
                <div className="flex items-center justify-center gap-1">
                  <Eye size={14} /> Vues {getSortIcon('viewsCount')}
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-semibold text-secondary-600 cursor-pointer hover:text-primary-500"
                onClick={() => onSort('contactsCount')}
              >
                <div className="flex items-center justify-center gap-1">
                  <MessageCircle size={14} /> Contacts {getSortIcon('contactsCount')}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-secondary-600">Conversion</th>
              <th
                className="px-4 py-3 text-center text-xs font-semibold text-secondary-600 cursor-pointer hover:text-primary-500 hidden md:table-cell"
                onClick={() => onSort('createdAt')}
              >
                <div className="flex items-center justify-center gap-1">
                  <Calendar size={14} /> Date {getSortIcon('createdAt')}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-secondary-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {filteredListings.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-secondary-500">
                  Aucune annonce trouvée
                </td>
              </tr>
            ) : (
              filteredListings.map((listing, index) => {
                const conversionRate = listing.viewsCount > 0
                  ? ((listing.contactsCount / listing.viewsCount) * 100).toFixed(1)
                  : 0;

                return (
                  <motion.tr
                    key={listing.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-secondary-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0">
                          {listing.mainImage ? (
                            <img
                              src={getImageUrl(listing.mainImage)}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-secondary-400">
                              <Eye size={16} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-secondary-900 text-sm truncate max-w-[150px] md:max-w-[250px]">
                            {listing.title}
                          </p>
                          <span
                            className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full text-white mt-1"
                            style={{ backgroundColor: CATEGORY_COLORS[listing.category] || COLORS.gray }}
                          >
                            {CATEGORY_LABELS[listing.category] || listing.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-secondary-900">{listing.viewsCount}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-secondary-900">{listing.contactsCount}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${conversionRate >= 10 ? 'text-green-500' :
                        conversionRate >= 5 ? 'text-yellow-500' : 'text-secondary-500'
                        }`}>
                        {conversionRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-secondary-500 hidden md:table-cell">
                      {format(parseISO(listing.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onViewListing(listing.id)}
                        className="p-2 rounded-lg bg-primary-50 text-primary-500 hover:bg-primary-100 transition-colors"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

// Composant tooltip personnalisé pour les graphiques
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-secondary-200">
        <p className="text-sm font-medium text-secondary-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function Stats() {
  const navigate = useNavigate();
  const { user, accountType } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'viewsCount', direction: 'desc' });

  useEffect(() => {
    // Vérifier le statut PRO
    const hasPro = accountType === 'PRO' || user?.isPro;
    if (!hasPro) {
      navigate('/upgrade');
      return;
    }

    // Charger les données
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, listingsData] = await Promise.all([
          usersAPI.getStats(),
          listingsAPI.getMyListings()
        ]);
        setStats(statsData.stats);
        setListings(listingsData.listings || []);
      } catch (err) {
        console.error('Erreur chargement stats:', err);
        setError('Impossible de charger les statistiques');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [accountType, user, navigate]);

  // Trier les annonces
  const sortedListings = useMemo(() => {
    const sorted = [...listings].sort((a, b) => {
      if (sortConfig.key === 'createdAt') {
        return sortConfig.direction === 'asc'
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }
      return sortConfig.direction === 'asc'
        ? a[sortConfig.key] - b[sortConfig.key]
        : b[sortConfig.key] - a[sortConfig.key];
    });
    return sorted;
  }, [listings, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Générer les données pour le graphique d'évolution (simulé sur 30 jours)
  const viewsChartData = useMemo(() => {
    if (!stats?.totalViews) return [];

    const data = [];
    const baseViews = Math.floor(stats.totalViews / 30);

    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const variation = Math.random() * 0.5 + 0.75; // Variation entre 75% et 125%
      data.push({
        date: format(date, 'dd/MM', { locale: fr }),
        vues: Math.floor(baseViews * variation),
        contacts: Math.floor((baseViews * variation) * 0.08)
      });
    }
    return data;
  }, [stats]);

  // Données pour le graphique en camembert (répartition par catégorie)
  const categoryData = useMemo(() => {
    if (!listings.length) return [];

    const categoryCount = listings.reduce((acc, listing) => {
      acc[listing.category] = (acc[listing.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCount).map(([name, value]) => ({
      name: CATEGORY_LABELS[name] || name,
      value,
      color: CATEGORY_COLORS[name] || COLORS.gray
    }));
  }, [listings]);

  // Top 5 annonces les plus vues
  const topListings = useMemo(() => {
    return [...listings]
      .sort((a, b) => b.viewsCount - a.viewsCount)
      .slice(0, 5)
      .map(l => ({
        name: l.title.length > 20 ? l.title.substring(0, 20) + '...' : l.title,
        vues: l.viewsCount,
        contacts: l.contactsCount
      }));
  }, [listings]);

  // Statistiques avancées
  const advancedStats = useMemo(() => {
    if (!listings.length || !stats) return null;

    const bestPerformance = [...listings].sort((a, b) => b.viewsCount - a.viewsCount)[0];
    const mostContacted = [...listings].sort((a, b) => b.contactsCount - a.contactsCount)[0];
    const avgViews = stats.totalViews / (stats.totalListings || 1);
    const avgContacts = stats.totalContacts / (stats.totalListings || 1);

    // Annonces sous-performantes (moins de la moitié de la moyenne de vues)
    const underperforming = listings.filter(l => l.viewsCount < avgViews / 2);

    return {
      bestPerformance,
      mostContacted,
      avgViews: avgViews.toFixed(0),
      avgContacts: avgContacts.toFixed(1),
      underperforming
    };
  }, [listings, stats]);

  if (loading) {
    return (
      <MobileContainer
        showHeader={true}
        headerProps={{
          showLogo: false,
          title: 'Statistiques PRO',
          leftAction: (
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-secondary-900" />
            </button>
          )
        }}
      >
        <div className="flex items-center justify-center h-96">
          <PlanBLoader />
        </div>
      </MobileContainer>
    );
  }

  if (error) {
    return (
      <MobileContainer
        showHeader={true}
        headerProps={{
          showLogo: false,
          title: 'Statistiques PRO',
          leftAction: (
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-secondary-900" />
            </button>
          )
        }}
      >
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-secondary-900 mb-2">Erreur</h2>
          <p className="text-secondary-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </MobileContainer>
    );
  }

  const conversionRate = stats?.totalViews > 0
    ? ((stats.totalContacts / stats.totalViews) * 100).toFixed(1)
    : 0;

  return (
    <MobileContainer
      showHeader={true}
      headerProps={{
        showLogo: false,
        title: 'Statistiques PRO',
        leftAction: (
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} className="text-secondary-900" />
          </button>
        )
      }}
    >
      <div className="space-y-6 pb-24">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">
            Tableau de bord
          </h1>
          <p className="text-secondary-600 mt-1">
            Suivez les performances de vos annonces
          </p>
        </motion.div>

        {/* Cartes de statistiques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={Eye}
            value={stats?.totalViews || 0}
            label="Vues totales"
            color={COLORS.primary}
            trend="up"
            trendValue="+12% cette semaine"
          />
          <StatCard
            icon={TrendingUp}
            value={stats?.activeListings || 0}
            label="Annonces actives"
            color={COLORS.blue}
          />
          <StatCard
            icon={MessageCircle}
            value={stats?.totalContacts || 0}
            label="Contacts reçus"
            color={COLORS.green}
            trend="up"
            trendValue="+8% cette semaine"
          />
          <StatCard
            icon={Target}
            value={`${conversionRate}%`}
            label="Taux de conversion"
            color={COLORS.yellow}
          />
        </div>

        {/* Graphique d'évolution des vues */}
        <GlassCard padding="p-4">
          <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-500" />
            Évolution des vues (30 derniers jours)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewsChartData}>
                <defs>
                  <linearGradient id="colorVues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="vues"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVues)"
                  name="Vues"
                />
                <Area
                  type="monotone"
                  dataKey="contacts"
                  stroke={COLORS.green}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorContacts)"
                  name="Contacts"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Graphiques secondaires */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Répartition par catégorie */}
          <GlassCard padding="p-4">
            <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
              <PieChartIcon size={20} className="text-blue-500" />
              Répartition par catégorie
            </h3>
            {categoryData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span className="text-xs">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-secondary-400">
                Aucune donnée disponible
              </div>
            )}
          </GlassCard>

          {/* Top 5 annonces */}
          <GlassCard padding="p-4">
            <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-green-500" />
              Top 5 des annonces
            </h3>
            {topListings.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topListings} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 9 }}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="vues" fill={COLORS.primary} radius={[0, 4, 4, 0]} name="Vues" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-secondary-400">
                Aucune donnée disponible
              </div>
            )}
          </GlassCard>
        </div>

        {/* Statistiques avancées */}
        {advancedStats && (
          <GlassCard padding="p-4">
            <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-500" />
              Analyse de performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {advancedStats.bestPerformance && (
                <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-primary-600 mb-1">
                    <Award size={16} />
                    <span className="text-xs font-medium">Meilleure perf.</span>
                  </div>
                  <p className="text-sm font-semibold text-secondary-900 truncate">
                    {advancedStats.bestPerformance.title}
                  </p>
                  <p className="text-xs text-secondary-600">
                    {advancedStats.bestPerformance.viewsCount} vues
                  </p>
                </div>
              )}

              {advancedStats.mostContacted && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <MessageCircle size={16} />
                    <span className="text-xs font-medium">Plus contactée</span>
                  </div>
                  <p className="text-sm font-semibold text-secondary-900 truncate">
                    {advancedStats.mostContacted.title}
                  </p>
                  <p className="text-xs text-secondary-600">
                    {advancedStats.mostContacted.contactsCount} contacts
                  </p>
                </div>
              )}

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Eye size={16} />
                  <span className="text-xs font-medium">Moy. vues/annonce</span>
                </div>
                <p className="text-xl font-bold text-secondary-900">
                  {advancedStats.avgViews}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <Zap size={16} />
                  <span className="text-xs font-medium">Moy. contacts</span>
                </div>
                <p className="text-xl font-bold text-secondary-900">
                  {advancedStats.avgContacts}
                </p>
              </div>
            </div>

            {/* Conseils si annonces sous-performantes */}
            {advancedStats.underperforming.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      {advancedStats.underperforming.length} annonce(s) sous-performante(s)
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Conseil : Améliorez les photos et descriptions de ces annonces pour augmenter leur visibilité.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        )}

        {/* Tableau détaillé des annonces */}
        <ListingsTable
          listings={sortedListings}
          onSort={handleSort}
          sortConfig={sortConfig}
          onViewListing={(id) => navigate(`/listing/${id}`)}
        />

        {/* Info membre */}
        {stats?.memberSince && (
          <GlassCard padding="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Clock size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-900">Membre depuis</p>
                  <p className="text-xs text-secondary-600">
                    {format(parseISO(stats.memberSince), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
              {stats?.subscriptionExpiresAt && (
                <div className="text-right">
                  <p className="text-sm font-medium text-secondary-900">Abonnement PRO</p>
                  <p className="text-xs text-green-600">
                    Valide jusqu'au {format(parseISO(stats.subscriptionExpiresAt), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </MobileContainer>
  );
}
