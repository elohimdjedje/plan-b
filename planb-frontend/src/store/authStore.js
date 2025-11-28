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
      
      // Actions
      login: (userData, token) => {
        localStorage.setItem('token', token);
        set({
          user: userData,
          token,
          isAuthenticated: true,
          accountType: userData.accountType || 'FREE',
        });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          accountType: 'FREE',
        });
      },
      
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },
      
      upgradeToPro: () => {
        set((state) => ({
          user: { ...state.user, accountType: 'PRO' },
          accountType: 'PRO',
        }));
      },
      
      // Getters
      isPro: () => get().accountType === 'PRO',
      isLoggedIn: () => get().isAuthenticated,
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

// Exposer le store globalement pour un accès depuis auth.js
if (typeof window !== 'undefined') {
  window.useAuthStore = useAuthStore;
}
