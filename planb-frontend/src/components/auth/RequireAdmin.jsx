import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * Composant de protection des routes ADMIN
 * Redirige vers / si l'utilisateur n'est pas admin
 * Double vérification : token + rôle ROLE_ADMIN
 */
export default function RequireAdmin({ children }) {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Pas de token = pas connecté = redirection vers login
  if (!token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Connecté mais pas admin = redirection vers accueil (interdit)
  if (!user?.roles?.includes('ROLE_ADMIN')) {
    console.warn('⛔ Tentative d\'accès admin non autorisée');
    return <Navigate to="/" replace />;
  }

  // Admin confirmé = accès autorisé
  return children;
}
