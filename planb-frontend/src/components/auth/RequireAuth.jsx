import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * Composant de protection des routes
 * Redirige vers /auth si l'utilisateur n'est pas connecté
 * Optimisé : utilise le cache authStore pour un chargement instantané
 */
export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Simple : si pas de token, rediriger
  if (!token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Si token existe, laisser passer
  return children;
}
