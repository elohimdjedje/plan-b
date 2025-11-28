import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, Check, CheckCheck, AlertCircle, TrendingDown, RefreshCw, X } from 'lucide-react';
import MobileContainer from '../components/layout/MobileContainer';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications 
} from '../utils/notifications';
import { formatRelativeDate } from '../utils/format';
import { toast } from 'react-hot-toast';

/**
 * Page des notifications
 * Affiche les changements de statut des annonces favorites
 */
export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const userNotifications = getUserNotifications();
    setNotifications(userNotifications);
  };

  const handleMarkAsRead = (notificationId) => {
    markNotificationAsRead(notificationId);
    loadNotifications();
    toast.success('Notification marquée comme lue');
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    loadNotifications();
    toast.success('Toutes les notifications marquées comme lues');
  };

  const handleDelete = (notificationId) => {
    deleteNotification(notificationId);
    loadNotifications();
    toast.success('Notification supprimée');
  };

  const handleClearAll = () => {
    if (window.confirm('Supprimer toutes les notifications ?')) {
      clearAllNotifications();
      loadNotifications();
      toast.success('Toutes les notifications supprimées');
    }
  };

  const handleNotificationClick = (notification) => {
    // Marquer comme lu
    if (!notification.read) {
      markNotificationAsRead(notification.id);
      loadNotifications();
    }
    
    // Naviguer vers l'annonce si elle existe encore
    if (notification.type !== 'deleted' && notification.listingId) {
      navigate(`/listing/${notification.listingId}`);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Icône selon le type de notification
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'deleted':
        return <X size={20} className="text-red-500" />;
      case 'status_change':
        return <RefreshCw size={20} className="text-blue-500" />;
      case 'price_change':
        return <TrendingDown size={20} className="text-orange-500" />;
      default:
        return <Bell size={20} className="text-primary-500" />;
    }
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
              {notifications.length > 0 && (
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
              Toutes ({notifications.length})
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

        {/* Liste des notifications */}
        {filteredNotifications.length === 0 ? (
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
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    !notification.read ? 'bg-primary-50/50 border-primary-200' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    {/* Icône */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      !notification.read ? 'bg-primary-100' : 'bg-secondary-100'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${
                        !notification.read ? 'text-secondary-900' : 'text-secondary-700'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">
                        {formatRelativeDate(notification.createdAt)}
                      </p>

                      {/* Type de notification */}
                      <div className="flex gap-2 mt-2">
                        {notification.type === 'deleted' && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            Supprimée
                          </span>
                        )}
                        {notification.type === 'status_change' && notification.newStatus === 'sold' && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Vendue/Occupée
                          </span>
                        )}
                        {notification.type === 'status_change' && notification.newStatus === 'expired' && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                            Expirée
                          </span>
                        )}
                        {notification.type === 'status_change' && notification.newStatus === 'active' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Republiée
                          </span>
                        )}
                        {notification.type === 'price_change' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            Prix modifié
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
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
                          handleDelete(notification.id);
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
                Vous recevez des notifications quand vos annonces favorites changent de statut (vendue, expirée, republiée) ou sont supprimées par le vendeur.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </MobileContainer>
  );
}
