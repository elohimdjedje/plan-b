/**
 * Service API pour PlanB Frontend
 * Gère l'authentification JWT avec Axios et intercepteurs
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ==================== TOKEN MANAGEMENT ====================
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setRefreshToken = (token) => localStorage.setItem('refreshToken', token);
const removeRefreshToken = () => localStorage.removeItem('refreshToken');
const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};
const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
const removeUser = () => localStorage.removeItem('user');

// ==================== AXIOS INSTANCE ====================
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag pour éviter les appels multiples de refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// ==================== REQUEST INTERCEPTOR ====================
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ==================== RESPONSE INTERCEPTOR ====================
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si erreur 401 et pas déjà en train de retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Si c'est la route login ou refresh-token, ne pas tenter de refresh
            if (originalRequest.url.includes('/auth/login') || 
                originalRequest.url.includes('/auth/refresh-token')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Ajouter à la queue si déjà en train de refresh
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getRefreshToken();

            if (!refreshToken) {
                // Pas de refresh token, déconnecter
                isRefreshing = false;
                removeToken();
                removeRefreshToken();
                removeUser();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Appeler l'endpoint refresh-token
                const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                    refreshToken: refreshToken
                });

                const { token, refreshToken: newRefreshToken } = response.data;

                // Sauvegarder les nouveaux tokens
                setToken(token);
                if (newRefreshToken) {
                    setRefreshToken(newRefreshToken);
                }

                // Mettre à jour le header et relancer la requête
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                originalRequest.headers.Authorization = `Bearer ${token}`;

                processQueue(null, token);
                isRefreshing = false;

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                // Refresh échoué, déconnecter
                removeToken();
                removeRefreshToken();
                removeUser();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// ==================== AUTH ====================
export const authService = {
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            const data = response.data;
            if (data.token) {
                setToken(data.token);
                if (data.refreshToken) {
                    setRefreshToken(data.refreshToken);
                }
                setUser(data.user);
            }
            return { ok: true, data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async sendOTP(phone) {
        try {
            const response = await api.post('/auth/send-otp', { phone });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async verifyOTP(phone, code) {
        try {
            const response = await api.post('/auth/verify-otp', { phone, code });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async forgotPassword(email) {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async resetPassword(email, code, password) {
        try {
            const response = await api.post('/auth/reset-password', { email, code, password });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getMe() {
        try {
            const response = await api.get('/auth/me');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async updateProfile(profileData) {
        try {
            const response = await api.put('/auth/update-profile', profileData);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    logout() {
        removeToken();
        removeRefreshToken();
        removeUser();
        window.location.href = '/login';
    },

    isAuthenticated() {
        return !!getToken();
    },

    getToken,
    getRefreshToken,
    getUser,
};

// ==================== PAYMENTS ====================
export const paymentService = {
    async createSubscription(months, paymentMethod, phoneNumber = null) {
        try {
            const response = await api.post('/payments/create-subscription', { months, paymentMethod, phoneNumber });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async confirmWavePayment(months, amount, phoneNumber) {
        try {
            const response = await api.post('/payments/confirm-wave', { months, amount, phoneNumber });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async boostListing(listingId) {
        try {
            const response = await api.post('/payments/boost-listing', { listing_id: listingId });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getPaymentStatus(paymentId) {
        try {
            const response = await api.get(`/payments/${paymentId}/status`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getPaymentHistory() {
        try {
            const response = await api.get('/payments/history');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    // Prix des abonnements PRO
    getSubscriptionPrices() {
        return {
            1: { price: 5000, label: '1 mois' },
            3: { price: 12000, label: '3 mois', savings: 3000 },
            6: { price: 22000, label: '6 mois', savings: 8000 },
            12: { price: 40000, label: '12 mois', savings: 20000 },
        };
    },

    // Méthodes de paiement disponibles
    getPaymentMethods() {
        return [
            { 
                id: 'wave', 
                name: 'Wave', 
                logo: '/images/wave.webp',
                description: 'Paiement mobile Wave',
                countries: ['SN', 'CI', 'ML', 'BF'],
                requiresPhone: true
            },
            { 
                id: 'orange_money', 
                name: 'Orange Money', 
                logo: '/images/orange.webp',
                description: 'Paiement mobile Orange',
                countries: ['SN', 'CI', 'ML', 'BF', 'GN'],
                requiresPhone: true
            },
            { 
                id: 'moov_money', 
                name: 'Moov Money', 
                logo: '/images/moov.jpg',
                description: 'Paiement mobile Moov',
                countries: ['CI', 'BF', 'BJ', 'TG'],
                requiresPhone: true
            },
            { 
                id: 'mtn_money', 
                name: 'MTN Mobile Money', 
                logo: '/images/mtn.jpeg',
                description: 'Paiement mobile MTN',
                countries: ['CI', 'GH', 'CM', 'BJ'],
                requiresPhone: true
            },
            { 
                id: 'card', 
                name: 'Carte Bancaire', 
                logo: '/images/banque.webp',
                description: 'Visa, Mastercard',
                countries: ['*'],
                requiresPhone: false
            },
        ];
    }
};

// ==================== LISTINGS ====================
export const listingService = {
    async getAll(params = {}) {
        try {
            const response = await api.get('/listings', { params });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getOne(id) {
        try {
            const response = await api.get(`/listings/${id}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async create(listingData) {
        try {
            const response = await api.post('/listings', listingData);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async update(id, listingData) {
        try {
            const response = await api.put(`/listings/${id}`, listingData);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async delete(id) {
        try {
            const response = await api.delete(`/listings/${id}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getMyListings() {
        try {
            const response = await api.get('/listings/my');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async search(query, filters = {}) {
        try {
            const response = await api.post('/search/intelligent', { query, ...filters });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== UPLOAD ====================
export const uploadService = {
    async uploadImages(files) {
        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('images[]', file);
            });
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async deleteImage(filename) {
        try {
            const response = await api.delete(`/upload/${filename}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== REVIEWS ====================
export const reviewService = {
    async create(listingId, rating, comment, reviewType = 'transaction') {
        try {
            const response = await api.post('/reviews', { listingId, rating, comment, reviewType });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getSellerReviews(sellerId, page = 1, limit = 10) {
        try {
            const response = await api.get(`/reviews/seller/${sellerId}`, { params: { page, limit } });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getListingReviews(listingId) {
        try {
            const response = await api.get(`/reviews/listing/${listingId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async delete(reviewId) {
        try {
            const response = await api.delete(`/reviews/${reviewId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== NOTIFICATIONS ====================
export const notificationService = {
    async getAll(page = 1, limit = 20) {
        try {
            const response = await api.get('/notifications', { params: { page, limit } });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async markAsRead(notificationId) {
        try {
            const response = await api.post(`/notifications/${notificationId}/read`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async markAllAsRead() {
        try {
            const response = await api.post('/notifications/read-all');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async delete(notificationId) {
        try {
            const response = await api.delete(`/notifications/${notificationId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getUnreadCount() {
        try {
            const response = await api.get('/notifications/unread-count');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== FAVORITES ====================
export const favoriteService = {
    async getAll() {
        try {
            const response = await api.get('/favorites');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async add(listingId) {
        try {
            const response = await api.post('/favorites', { listingId });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async remove(listingId) {
        try {
            const response = await api.delete(`/favorites/${listingId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async check(listingId) {
        try {
            const response = await api.get(`/favorites/check/${listingId}`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== MESSAGES ====================
export const messageService = {
    async getConversations() {
        try {
            const response = await api.get('/conversations');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getMessages(conversationId) {
        try {
            const response = await api.get(`/conversations/${conversationId}/messages`);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async sendMessage(conversationId, content) {
        try {
            const response = await api.post(`/conversations/${conversationId}/messages`, { content });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async startConversation(listingId, message) {
        try {
            const response = await api.post('/conversations', { listingId, message });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== BOOKINGS ====================
export const bookingService = {
    async create(listingId, startDate, endDate, guests = 1) {
        try {
            const response = await api.post('/bookings', { listingId, startDate, endDate, guests });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getMyBookings() {
        try {
            const response = await api.get('/bookings/my');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async getBookingsForMyListings() {
        try {
            const response = await api.get('/bookings/received');
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },

    async updateStatus(bookingId, status) {
        try {
            const response = await api.put(`/bookings/${bookingId}/status`, { status });
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// ==================== CONTACT ====================
export const contactService = {
    async submit(data) {
        try {
            const response = await api.post('/contact', data);
            return { ok: true, data: response.data };
        } catch (error) {
            return { ok: false, data: error.response?.data || { error: error.message } };
        }
    },
};

// Export Axios instance for custom requests
export { api };

export default {
    auth: authService,
    payment: paymentService,
    listing: listingService,
    upload: uploadService,
    review: reviewService,
    notification: notificationService,
    favorite: favoriteService,
    message: messageService,
    booking: bookingService,
    contact: contactService,
};
