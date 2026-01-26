import { Star, AlertCircle, Info, CheckCircle, Trash2 } from 'lucide-react';
import { formatRelativeDate } from '../../utils/format';
import useNotificationStore from '../../store/notificationStore';

/**
 * Item individuel de notification
 */
export default function NotificationItem({ notification }) {
    const { markAsRead, deleteNotification } = useNotificationStore();

    const handleClick = () => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        // Naviguer vers l'action si data contient une URL
        if (notification.data?.url) {
            window.location.href = notification.data.url;
        }
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        deleteNotification(notification.id);
    };

    // Icône selon le type
    const getIcon = () => {
        switch (notification.type) {
            case 'review_received':
                return <Star size={20} className="text-yellow-500" />;
            case 'listing_expired':
            case 'subscription_expiring':
                return <AlertCircle size={20} className="text-orange-500" />;
            case 'favorite_removed':
                return <Info size={20} className="text-blue-500" />;
            default:
                return <CheckCircle size={20} className="text-green-500" />;
        }
    };

    // Couleur du fond selon priorité
    const getBgColor = () => {
        if (notification.isRead) return '';

        switch (notification.priority) {
            case 'critical':
                return 'bg-red-50';
            case 'high':
                return 'bg-orange-50';
            case 'medium':
                return 'bg-blue-50';
            default:
                return 'bg-secondary-50';
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`p-4 hover:bg-secondary-50 transition-colors cursor-pointer relative group ${getBgColor()}`}
        >
            <div className="flex items-start gap-3">
                {/* Icône */}
                <div className="flex-shrink-0 mt-1">
                    {getIcon()}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${notification.isRead ? 'text-secondary-700' : 'text-secondary-900'}`}>
                            {notification.title}
                        </h4>

                        {/* Badge "nouveau" */}
                        {!notification.isRead && (
                            <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full"></span>
                        )}
                    </div>

                    <p className="text-sm text-secondary-600 mt-1 line-clamp-2">
                        {notification.message}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-secondary-500">
                            {formatRelativeDate(notification.createdAt)}
                        </p>

                        {/* Bouton supprimer (visible au hover) */}
                        <button
                            onClick={handleDelete}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                            title="Supprimer"
                        >
                            <Trash2 size={14} className="text-red-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
