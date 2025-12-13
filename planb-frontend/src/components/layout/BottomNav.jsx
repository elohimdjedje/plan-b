import { useState, useEffect } from 'react';
import { Home, PlusCircle, User, LogIn, MapPin, Bell } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUnreadNotificationsCount } from '../../utils/notifications';

/**
 * Navigation Bottom avec 3 onglets et animation iOS
 */
export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [unreadCount, setUnreadCount] = useState(0);

  // Vérifier l'état de connexion à chaque changement de route
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, [location.pathname]);

  // Charger le nombre de notifications
  useEffect(() => {
    const count = getUnreadNotificationsCount();
    setUnreadCount(count);
  }, [location.pathname]);

  // Écouter les changements de storage (connexion/déconnexion)
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', checkAuth);

    // Vérifier périodiquement (pour les changements dans le même onglet)
    const interval = setInterval(checkAuth, 500);

    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  const tabs = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/map', icon: MapPin, label: 'Carte' },
    { path: '/publish', icon: PlusCircle, label: 'Publier', isMain: true },
    { path: '/notifications', icon: Bell, label: 'Alertes' },
    {
      path: isLoggedIn ? '/profile' : '/auth',
      icon: isLoggedIn ? User : LogIn,
      label: isLoggedIn ? 'Profil' : 'Connexion'
    },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/auth') {
      return location.pathname.startsWith('/auth');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      <div className="bg-white/70 backdrop-blur-2xl border-t border-sky-100/50 shadow-lg shadow-sky-100/20">
        <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5 relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            const isPublish = tab.isMain;

            // Bouton Publier central et mis en avant
            if (isPublish) {
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  state={{ fromNav: true }}
                  className="flex flex-col items-center -mt-6 relative"
                >
                  <div className={`
                    p-4 rounded-full shadow-lg shadow-blue-500/30 transform transition-all duration-200
                    ${active 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 scale-110' 
                      : 'bg-gradient-to-br from-blue-400 to-blue-500 hover:scale-105'
                    }
                  `}>
                    <Icon size={28} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span className={`text-xs font-semibold mt-1 ${active ? 'text-blue-500' : 'text-slate-600'}`}>
                    {tab.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={tab.path}
                to={tab.path}
                state={{ fromNav: true }}
                className={`
                  flex flex-col items-center gap-0.5 transition-all duration-200 relative
                  ${active ? 'text-blue-500' : 'text-slate-400'}
                `}
              >
                <div className="relative">
                  <Icon
                    size={22}
                    className={active ? 'text-blue-500' : 'text-slate-400'}
                  />
                  {/* Badge notifications */}
                  {tab.path === '/notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
