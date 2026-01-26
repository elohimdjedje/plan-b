import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Écoute sur toutes les interfaces réseau
    port: 5173,
  },
  // PWA - Service Worker
  publicDir: 'public',
  build: {
    // Optimisation du build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprime les console.log en production
        drop_debugger: true
      }
    },
    // Code splitting optimisé
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les bibliothèques volumineuses
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod']
        }
      }
    },
    // Augmenter la limite d'avertissement pour les chunks
    chunkSizeWarningLimit: 1000,
    // Optimisation des assets
    assetsInlineLimit: 4096, // Inline assets < 4kb
  },
  // Optimisation des dépendances
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'zustand']
  }
})
