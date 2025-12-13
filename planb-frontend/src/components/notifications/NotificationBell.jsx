import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useNotificationStore from '../../store/notificationStore';
import NotificationDropdown from './NotificationDropdown';

/**
 * Icône de notification avec badge dans le header
 */
export default function NotificationBell() {
    const [showDropdown, setShowDropdown] = useState(false);
    const { unreadCount, startPolling, stopPolling } = useNotificationStore();
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Démarre le polling au montage
        startPolling();

        // Arrête le polling au démontage
        return () => stopPolling();
    }, [startPolling, stopPolling]);

    // Ferme le dropdown si clic à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 hover:bg-secondary-100 rounded-xl transition-colors"
                title="Notifications"
            >
                <Bell size={24} className="text-secondary-600" />

                {/* Badge du compteur */}
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {showDropdown && (
                    <NotificationDropdown onClose={() => setShowDropdown(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}
