import { create } from 'zustand';
import axios from '../api/axios';

const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    pollingInterval: null,

    // Récupère les notifications
    fetchNotifications: async () => {
        try {
            set({ loading: true });
            const response = await axios.get('/api/notifications');

            if (response.data.success) {
                set({
                    notifications: response.data.data,
                    loading: false
                });
            }
        } catch (error) {
            console.error('Erreur chargement notifications:', error);
            set({ loading: false });
        }
    },

    // Récupère le compteur de non lues
    fetchUnreadCount: async () => {
        try {
            // Si l'utilisateur n'est pas connecté, ne pas appeler l'API
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }

            const response = await axios.get('/api/notifications/unread-count');

            if (response.data.success) {
                set({ unreadCount: response.data.count });
            }
        } catch (error) {
            console.error('Erreur compteur notifications:', error);
        }
    },

    // Marque une notification comme lue
    markAsRead: async (id) => {
        try {
            const response = await axios.post(`/api/notifications/${id}/read`);

            if (response.data.success) {
                set(state => ({
                    notifications: state.notifications.map(n =>
                        n.id === id ? { ...n, status: 'read', isRead: true, readAt: new Date().toISOString() } : n
                    ),
                    unreadCount: Math.max(0, state.unreadCount - 1)
                }));
            }
        } catch (error) {
            console.error('Erreur marquage notification:', error);
        }
    },

    // Marque toutes les notifications comme lues
    markAllAsRead: async () => {
        try {
            const response = await axios.post('/api/notifications/read-all');

            if (response.data.success) {
                set(state => ({
                    notifications: state.notifications.map(n => ({
                        ...n,
                        status: 'read',
                        isRead: true,
                        readAt: new Date().toISOString()
                    })),
                    unreadCount: 0
                }));
            }
        } catch (error) {
            console.error('Erreur marquage toutes:', error);
        }
    },

    // Supprime une notification
    deleteNotification: async (id) => {
        try {
            const response = await axios.delete(`/api/notifications/${id}`);

            if (response.data.success) {
                set(state => ({
                    notifications: state.notifications.filter(n => n.id !== id),
                    unreadCount: state.notifications.find(n => n.id === id && !n.isRead)
                        ? state.unreadCount - 1
                        : state.unreadCount
                }));
            }
        } catch (error) {
            console.error('Erreur suppression notification:', error);
        }
    },

    // Démarre le polling automatique
    startPolling: () => {
        const { pollingInterval } = get();

        // Si déjà en cours, ne pas redémarrer
        if (pollingInterval) return;

        // Première récupération immédiate
        get().fetchUnreadCount();

        // Ensuite toutes les 30 secondes
        const interval = setInterval(() => {
            get().fetchUnreadCount();
        }, 30000);

        set({ pollingInterval: interval });
    },

    // Arrête le polling
    stopPolling: () => {
        const { pollingInterval } = get();

        if (pollingInterval) {
            clearInterval(pollingInterval);
            set({ pollingInterval: null });
        }
    },

    // Nettoie le store  
    reset: () => {
        get().stopPolling();
        set({
            notifications: [],
            unreadCount: 0,
            loading: false,
            pollingInterval: null
        });
    }
}));

export default useNotificationStore;
