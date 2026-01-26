import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // État
      user: null,
      token: null,
      isAuthenticated: false,
      accountType: 'FREE',
      isLoading: false,

      // Actions
      login: (userData, token) => {
        if (!userData || !token) {
          console.warn('[AUTH] Données manquantes pour login');
          return;
        }

        console.log('[AUTH] Login successful for user:', userData.email);

        // Sauvegarder le token
        localStorage.setItem('token', token);

        // Mettre à jour le store
        set({
          user: userData,
          token,
          isAuthenticated: true,
          accountType: userData.accountType || userData.isPro ? 'PRO' : 'FREE',
          isLoading: false,
        });
      },

      logout: () => {
        console.log('[AUTH] Logging out');

        // Nettoyer localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('planb-auth-storage');

        // Reset du store
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          accountType: 'FREE',
          isLoading: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : userData,
          accountType: userData.accountType || (userData.isPro ? 'PRO' : state.accountType),
        }));
      },

      upgradeToPro: () => {
        set((state) => ({
          user: state.user ? { ...state.user, accountType: 'PRO', isPro: true } : null,
          accountType: 'PRO',
        }));
      },

      // Synchroniser le token entre localStorage et Zustand
      hydrateToken: () => {
        const localStorageToken = localStorage.getItem('token');
        const storeToken = get().token;

        // Si token dans localStorage mais pas dans store, restaurer
        if (localStorageToken && !storeToken) {
          console.log('[AUTH] Restoring token from localStorage');
          set({ token: localStorageToken });
        }

        // Si token dans store mais pas dans localStorage, sauvegarder
        else if (storeToken && !localStorageToken) {
          console.log('[AUTH] Saving token to localStorage');
          localStorage.setItem('token', storeToken);
        }

        // Si désynchronisation, localStorage fait foi
        else if (localStorageToken && storeToken && localStorageToken !== storeToken) {
          console.warn('[AUTH] Token mismatch, using localStorage version');
          set({ token: localStorageToken });
        }
      },

      // Vérifier et synchroniser le token au démarrage
      checkAuth: () => {
        // D'abord, synchroniser
        get().hydrateToken();

        const token = localStorage.getItem('token');
        const state = get();

        console.log('[AUTH] checkAuth -', {
          hasToken: !!token,
          isAuthenticated: state.isAuthenticated,
          hasUser: !!state.user
        });

        // Si pas de token mais store dit connecté, déconnecter
        if (!token && state.isAuthenticated) {
          console.warn('[AUTH] No token but authenticated, logging out');
          get().logout();
          return false;
        }

        // Si token présent et store dit connecté, OK
        if (token && state.isAuthenticated && state.user) {
          return true;
        }

        return !!token;
      },

      // Getters
      isPro: () => get().accountType === 'PRO' || get().user?.isPro === true,
      isLoggedIn: () => get().isAuthenticated && !!localStorage.getItem('token'),
    }),
    {
      name: 'planb-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        accountType: state.accountType,
      }),
    }
  )
);

// Exposer le store globalement
if (typeof window !== 'undefined') {
  window.useAuthStore = useAuthStore;

  // Vérifier l'auth au chargement avec logs détaillés
  setTimeout(() => {
    console.log('[AUTH STORE] Initialisation au démarrage...');
    console.log('[AUTH STORE] localStorage.token:', localStorage.getItem('token') ? 'présent' : 'absent');
    console.log('[AUTH STORE] Store state:', {
      isAuthenticated: useAuthStore.getState().isAuthenticated,
      user: useAuthStore.getState().user?.email || 'null',
      token: useAuthStore.getState().token ? 'présent' : 'absent'
    });
    useAuthStore.getState().checkAuth();
  }, 100);
}

// Export par défaut pour compatibilité avec différents patterns d'import
export default useAuthStore;
