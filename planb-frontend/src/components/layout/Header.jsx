import { MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from '../notifications/NotificationBell';

/**
 * Header avec logo Plan B et notifications
 */
export default function Header({ showLogo = true, title, actions, leftAction, transparent = false, showNotifications = true, scrollProgress = 0 }) {
  const navigate = useNavigate();

  // Calculer l'opacité du logo basée sur le scroll (disparaît progressivement)
  const logoOpacity = transparent ? Math.max(0, 1 - scrollProgress * 1.5) : 1;
  // Calculer l'opacité du fond du header (apparaît progressivement)
  const headerBgOpacity = transparent ? Math.min(scrollProgress * 1.2, 0.9) : 1;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 safe-top">
      <div
        className={`transition-all duration-150 ${transparent ? '' : 'bg-white/70 backdrop-blur-2xl border-b border-sky-100/50 shadow-sm'}`}
        style={transparent ? {
          backgroundColor: `rgba(255, 255, 255, ${headerBgOpacity * 0.7})`,
          backdropFilter: scrollProgress > 0.1 ? 'blur(20px)' : 'none',
          borderBottom: scrollProgress > 0.3 ? '1px solid rgba(186, 230, 253, 0.5)' : 'none'
        } : {}}
      >
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          {/* Bouton retour à gauche (si présent) */}
          {leftAction && !showLogo && (
            <div className="flex-shrink-0">
              {leftAction}
            </div>
          )}

          {/* Logo à gauche ou Titre au centre */}
          {showLogo ? (
            <Link
              to="/"
              className="flex items-center flex-shrink-0 transition-all duration-200"
              style={{
                opacity: logoOpacity,
                transform: `scale(${1 - scrollProgress * 0.2})`,
                pointerEvents: logoOpacity < 0.3 ? 'none' : 'auto'
              }}
            >
              <img
                src="/plan-b-logo.png"
                alt="Plan B"
                className="h-16 w-auto object-contain hover:opacity-80 transition-opacity"
              />
            </Link>
          ) : title ? (
            <h1 className={`text-xl font-bold text-secondary-900 ${leftAction ? 'ml-4' : ''} flex-1`}>
              {title}
            </h1>
          ) : (
            <div className="flex-1" />
          )}

          {/* Actions à droite (conversations + notifications) */}
          {(showLogo || actions) && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions || (
                !transparent && showNotifications && (
                  <>
                    {/* Icône carte */}
                    <button
                      onClick={() => navigate('/map')}
                      className="relative p-2 hover:bg-secondary-100 rounded-xl transition-colors"
                      title="Carte des annonces"
                    >
                      <MapPin size={24} className="text-secondary-600" />
                    </button>

                    {/* Composant Notifications */}
                    <NotificationBell />
                  </>
                )
              )}
            </div>
          )}

          {/* Espace vide à droite si pas de logo et pas d'actions (pour équilibrer) */}
          {!showLogo && !actions && leftAction && (
            <div className="w-10 flex-shrink-0" />
          )}
        </div>
      </div>
    </header>
  );
}
