import { Bell, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUnreadNotificationsCount } from '../../utils/notifications';

/**
 * Header avec logo Plan B et notifications
 */
export default function Header({ showLogo = true, title, actions, leftAction, transparent = false, showNotifications = true }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Charger le nombre de notifications non lues
    const count = getUnreadNotificationsCount();
    setUnreadCount(count);

    // DÉSACTIVÉ temporairement pour éviter de surcharger le serveur
    // TODO: Réactiver quand on utilisera un vrai serveur (pas PHP built-in)
    // const interval = setInterval(() => {
    //   const newCount = getUnreadNotificationsCount();
    //   setUnreadCount(newCount);
    // }, 10000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 safe-top">
      <div className={transparent ? 'bg-transparent' : 'bg-white/40 backdrop-blur-2xl border-b border-white/30'}>
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          {/* Bouton retour à gauche (si présent) */}
          {leftAction && !showLogo && (
            <div className="flex-shrink-0">
              {leftAction}
            </div>
          )}

          {/* Logo à gauche ou Titre au centre */}
          {showLogo ? (
            <Link to="/" className="flex items-center flex-shrink-0">
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
                showNotifications && (
                  <>
                    {/* Icône carte */}
                    <button 
                      onClick={() => navigate('/map')}
                      className="relative p-2 hover:bg-secondary-100 rounded-xl transition-colors"
                      title="Carte des annonces"
                    >
                      <MapPin size={24} className="text-secondary-600" />
                    </button>
                    
                    {/* Icône notifications */}
                    <button 
                      onClick={() => navigate('/notifications')}
                      className="relative p-2 hover:bg-secondary-100 rounded-xl transition-colors"
                      title="Notifications"
                    >
                      <Bell size={24} className="text-secondary-600" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
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
