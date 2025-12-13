import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCheck } from 'lucide-react';
import useNotificationStore from '../../store/notificationStore';
import NotificationItem from './NotificationItem';
import PlanBLoader from '../animations/PlanBLoader';

/**
 * Dropdown des notifications
 */
export default function NotificationDropdown({ onClose }) {
    const {
        notifications,
        loading,
        unreadCount,
        fetchNotifications,
        markAllAsRead
    } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAllRead = async () => {
        await markAllAsRead();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-secondary-200 overflow-hidden z-50"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-200 bg-secondary-50">
                <div>
                    <h3 className="font-semibold text-secondary-900">Notifications</h3>
                    {unreadCount > 0 && (
                        <p className="text-sm text-secondary-600">
                            {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                            title="Tout marquer comme lu"
                        >
                            <CheckCheck size={18} className="text-primary-600" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                        <X size={18} className="text-secondary-600" />
                    </button>
                </div>
            </div>

            {/* Liste des notifications */}
            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <PlanBLoader />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-secondary-600">
                        <Bell size={48} className="mx-auto mb-3 opacity-30" />
                        <p>Aucune notification</p>
                    </div>
                ) : (
                    <div className="divide-y divide-secondary-100">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-secondary-200 bg-secondary-50">
                    <button
                        onClick={onClose}
                        className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Voir toutes les notifications
                    </button>
                </div>
            )}
        </motion.div>
    );
}
