import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Trash2, Check, CheckCheck, AlertCircle, TrendingDown, RefreshCw, X,
  Heart, Clock, CreditCard, Star, MessageCircle, Sparkles, Settings, Archive,
  ChevronLeft, AlertTriangle
} from 'lucide-react';
import MobileContainer from '../components/layout/MobileContainer';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import { 
  getUserNotifications, 
  markNotificationAsRead as markLocalNotificationAsRead, 
  markAllNotificationsAsRead as markAllLocalNotificationsAsRead,
  deleteNotification as deleteLocalNotification,
  clearAllNotifications 
} from '../utils/notifications';
import * as notificationsApi from '../api/notifications';
import { formatRelativeDate } from '../utils/format';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

// Configuration des icônes et couleurs par type
const NotificationTypeConfig = {
  'favorite_unavailable': { icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
  'listing_expired': { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
  'listing_expiring_soon': { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  'subscription_expiring': { icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
  'subscription_expired': { icon: CreditCard, color: 'text-red-500', bg: 'bg-red-50' },
  'review_received': { icon: Star, color: 'text-purple-500', bg: 'bg-purple-50' },
  'new_message': { icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-50' },
  'listing_published': { icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  'welcome': { icon: Bell, color: 'text-blue-500', bg: 'bg-blue-50' },
  // Types localStorage
  'deleted': { icon: X, color: 'text-red-500', bg: 'bg-red-50' },
  'status_change': { icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-50' },
  'price_change': { icon: TrendingDown, color: 'text-orange-500', bg: 'bg-orange-50' }
};

/**
 * Page des notifications
 * Combine les notifications du backend et du localStorage
 */
export default function Notifications() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [localNotifications, setLocalNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [stats, setStats] = useState({ unread: 0, total: 0 });

  useEffect(() => {
    loadAllNotifications();
  }, [filter, isAuthenticated]);

  const loadAllNotifications = async () => {
    setLoading(true);
    try {
      // Charger les notifications localStorage
      const local = getUserNotifications();
      setLocalNotifications(local);

      // Si authentifié, charger aussi depuis le backend
      if (isAuthenticated) {
        const status = filter === 'all' ? null : filter;
        const response = await notificationsApi.getNotifications(status);
        if (response.success) {
          // Transformer les notifications backend
          const backendNotifs = response.data.map(n => ({
            ...n,
            read: n.isRead || n.status === 'read',
            source: 'backend'
          }));
          setNotifications(backendNotifs);
          
          // Stats
          const statsResponse = await notificationsApi.getNotificationStats();
          if (statsResponse.success) {
            setStats(statsResponse.data);
          }
        }
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
      // En cas d'erreur, on garde les notifications locales
    } finally {
      setLoading(false);
    }
  };

  // Combiner notifications backend et localStorage
  const allNotifications = [
    ...notifications,
    ...localNotifications.map(n => ({ ...n, source: 'local' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredNotifications = allNotifications.filter(n => {
    if (filter === 'unread') return !n.read && n.status !== 'read';
    if (filter === 'read') return n.read || n.status === 'read';
    return true;
  });

  const unreadCount = allNotifications.filter(n => !n.read && n.status !== 'read').length;

  const handleMarkAsRead = async (notification) => {
    if (notification.source === 'local') {
      markLocalNotificationAsRead(notification.id);
      setLocalNotifications(getUserNotifications());
    } else {
      try {
        await notificationsApi.markAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true, status: 'read' } : n)
        );
        setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      } catch (err) {
        console.error('Erreur:', err);
      }
    }
    toast.success('Notification marquée comme lue');
  };

  const handleMarkAllAsRead = async () => {
    // Marquer local
    markAllLocalNotificationsAsRead();
    setLocalNotifications(getUserNotifications());

    // Marquer backend si connecté
    if (isAuthenticated) {
      try {
        await notificationsApi.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true, status: 'read' })));
        setStats(prev => ({ ...prev, unread: 0 }));
      } catch (err) {
        console.error('Erreur:', err);
      }
    }
    toast.success('Toutes les notifications marquées comme lues');
  };

  const handleDelete = async (notification) => {
    if (notification.source === 'local') {
      deleteLocalNotification(notification.id);
      setLocalNotifications(getUserNotifications());
    } else {
      try {
        await notificationsApi.deleteNotification(notification.id);
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      } catch (err) {
        console.error('Erreur:', err);
      }
    }
    toast.success('Notification supprimée');
  };

  const handleClearAll = () => {
    if (window.confirm('Supprimer toutes les notifications ?')) {
      clearAllNotifications();
      setLocalNotifications([]);
      // Note: on ne supprime pas les notifications backend, seulement les locales
      toast.success('Notifications locales supprimées');
    }
  };

  const handleNotificationClick = async (notification) => {
    // Marquer comme lu
    if (!notification.read && notification.status !== 'read') {
      await handleMarkAsRead(notification);
    }
    
    // Navigation selon le type
    const data = notification.data || {};
    switch (notification.type) {
      case 'listing_expired':
      case 'listing_expiring_soon':
      case 'listing_published':
        if (data.listingId) navigate(`/listing/${data.listingId}`);
        break;
      case 'favorite_unavailable':
        navigate('/favorites');
        break;
      case 'subscription_expiring':
      case 'subscription_expired':
        navigate('/profile');
        break;
      case 'review_received':
        navigate('/profile');
        break;
      case 'deleted':
        navigate('/favorites');
        break;
      case 'status_change':
      case 'price_change':
        if (notification.listingId) navigate(`/listing/${notification.listingId}`);
        break;
      default:
        if (notification.listingId) navigate(`/listing/${notification.listingId}`);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await notificationsApi.getNotificationPreferences();
      if (response.success) {
        setPreferences(response.data);
      }
    } catch (err) {
      console.error('Erreur chargement préférences:', err);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await notificationsApi.updateNotificationPreferences(preferences);
      setShowPreferences(false);
      toast.success('Préférences enregistrées');
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  // Icône selon le type de notification
  const getNotificationIcon = (type) => {
    const config = NotificationTypeConfig[type] || NotificationTypeConfig['welcome'];
    const IconComponent = config.icon;
    return <IconComponent size={20} className={config.color} />;
  };

  const getNotificationBg = (type) => {
    const config = NotificationTypeConfig[type] || NotificationTypeConfig['welcome'];
    return config.bg;
  };

  // Badge de priorité
  const PriorityBadge = ({ priority }) => {
    if (!priority || priority === 'low' || priority === 'medium') return null;
    const colors = priority === 'urgent' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white';
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors}`}>
        {priority === 'urgent' ? 'Urgent' : 'Important'}
      </span>
    );
  };

  return (
    <MobileContainer 
      headerProps={{ 
        showLogo: false, 
        title: 'Notifications',
        showBack: true 
      }}
    >
      <div className="space-y-4">
        {/* En-tête avec actions */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-secondary-900">Notifications</h2>
              <p className="text-sm text-secondary-600">
                {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}
              </p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck size={20} />
                </button>
              )}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    loadPreferences();
                    setShowPreferences(true);
                  }}
                  className="p-2 rounded-lg bg-secondary-100 text-secondary-600 hover:bg-secondary-200 transition-colors"
                  title="Préférences"
                >
                  <Settings size={20} />
                </button>
              )}
              {allNotifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  title="Tout supprimer"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              }`}
            >
              Toutes ({allNotifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                filter === 'unread'
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
              }`}
            >
              Non lues ({unreadCount})
            </button>
          </div>
        </GlassCard>

        {/* Chargement */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-secondary-500">Chargement...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <GlassCard className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center">
                <Bell size={32} className="text-secondary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-secondary-900 mb-2">
                  {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
                </h3>
                <p className="text-secondary-600 text-sm">
                  {filter === 'unread' 
                    ? 'Vous avez tout lu !' 
                    : 'Les changements sur vos annonces favorites apparaîtront ici'}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => navigate('/favorites')}
              >
                Voir mes favoris
              </Button>
            </div>
          </GlassCard>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={`${notification.source}-${notification.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    !notification.read && notification.status !== 'read' 
                      ? 'bg-primary-50/50 border-primary-200' 
                      : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    {/* Icône */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      getNotificationBg(notification.type)
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <p className={`font-medium ${
                          !notification.read && notification.status !== 'read' 
                            ? 'text-secondary-900' 
                            : 'text-secondary-700'
                        }`}>
                          {notification.title || notification.message}
                        </p>
                        <PriorityBadge priority={notification.priority} />
                      </div>
                      
                      {notification.message && notification.title && (
                        <p className="text-sm text-secondary-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      )}
                      
                      <p className="text-xs text-secondary-500 mt-1">
                        {formatRelativeDate(notification.createdAt)}
                        {notification.source === 'backend' && (
                          <span className="ml-2 text-primary-500">• Serveur</span>
                        )}
                      </p>

                      {/* Type de notification */}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {notification.type === 'subscription_expiring' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Abonnement
                          </span>
                        )}
                        {notification.type === 'subscription_expired' && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            Abonnement expiré
                          </span>
                        )}
                        {notification.type === 'listing_expired' && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                            Annonce expirée
                          </span>
                        )}
                        {notification.type === 'listing_expiring_soon' && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            Expire bientôt
                          </span>
                        )}
                        {notification.type === 'favorite_unavailable' && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            Favori indisponible
                          </span>
                        )}
                        {notification.type === 'review_received' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            Avis reçu
                          </span>
                        )}
                        {notification.type === 'listing_published' && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                            Publiée
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {!notification.read && notification.status !== 'read' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification);
                          }}
                          className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                          title="Marquer comme lu"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification);
                        }}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Info */}
        <GlassCard className="bg-blue-50/50 border-blue-200">
          <div className="flex gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">À propos des notifications</h4>
              <p className="text-sm text-blue-700">
                {isAuthenticated 
                  ? 'Vous recevez des notifications pour vos annonces, abonnement, avis et favoris.'
                  : 'Connectez-vous pour recevoir des notifications sur vos annonces et abonnement.'}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Modal Préférences */}
      <AnimatePresence>
        {showPreferences && preferences && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowPreferences(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full rounded-t-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
                <h2 className="text-lg font-semibold">Préférences de notification</h2>
                <button 
                  onClick={() => setShowPreferences(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-4 space-y-6">
                {/* Types de notifications */}
                <div>
                  <h3 className="font-medium text-secondary-700 mb-3">Types de notifications</h3>
                  <div className="space-y-4">
                    <PreferenceToggle
                      label="Favoris indisponibles"
                      description="Quand une annonce favorite n'est plus disponible"
                      value={preferences.favoritesRemoved}
                      onChange={(v) => setPreferences({ ...preferences, favoritesRemoved: v })}
                    />
                    <PreferenceToggle
                      label="Expiration d'annonces"
                      description="Rappels avant l'expiration de vos annonces"
                      value={preferences.listingExpired}
                      onChange={(v) => setPreferences({ ...preferences, listingExpired: v })}
                    />
                    <PreferenceToggle
                      label="Expiration d'abonnement"
                      description="Rappels avant l'expiration de votre abonnement PRO"
                      value={preferences.subscriptionExpiring}
                      onChange={(v) => setPreferences({ ...preferences, subscriptionExpiring: v })}
                    />
                    <PreferenceToggle
                      label="Avis reçus"
                      description="Quand quelqu'un vous laisse un avis"
                      value={preferences.reviewReceived}
                      onChange={(v) => setPreferences({ ...preferences, reviewReceived: v })}
                    />
                    {preferences.reviewReceived && (
                      <div className="ml-6 pt-2 border-l-2 border-secondary-200 pl-4">
                        <PreferenceToggle
                          label="Uniquement les avis négatifs"
                          description="Ne recevoir que les avis de moins de 3 étoiles"
                          value={preferences.reviewNegativeOnly}
                          onChange={(v) => setPreferences({ ...preferences, reviewNegativeOnly: v })}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Canaux */}
                <div>
                  <h3 className="font-medium text-secondary-700 mb-3">Canaux de notification</h3>
                  <div className="space-y-4">
                    <PreferenceToggle
                      label="Notifications email"
                      description="Recevoir les notifications par email"
                      value={preferences.emailEnabled}
                      onChange={(v) => setPreferences({ ...preferences, emailEnabled: v })}
                    />
                    <PreferenceToggle
                      label="Notifications push"
                      description="Recevoir les notifications push"
                      value={preferences.pushEnabled}
                      onChange={(v) => setPreferences({ ...preferences, pushEnabled: v })}
                    />
                  </div>
                </div>

                {/* Fréquence email */}
                {preferences.emailEnabled && (
                  <div>
                    <h3 className="font-medium text-secondary-700 mb-3">Fréquence des emails</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'immediate', label: 'Immédiat' },
                        { key: 'daily', label: 'Quotidien' },
                        { key: 'weekly', label: 'Hebdo' }
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setPreferences({ ...preferences, emailFrequency: key })}
                          className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                            preferences.emailFrequency === key
                              ? 'bg-primary-500 text-white'
                              : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bouton sauvegarder */}
                <Button onClick={handleSavePreferences} className="w-full">
                  Enregistrer les préférences
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileContainer>
  );
}

// Composant Toggle pour les préférences
function PreferenceToggle({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="font-medium text-secondary-800">{label}</p>
        <p className="text-xs text-secondary-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${
          value ? 'bg-primary-500' : 'bg-secondary-200'
        }`}
      >
        <div 
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            value ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}
