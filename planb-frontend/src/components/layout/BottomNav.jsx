import { Home, PlusCircle, User, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Navigation Bottom avec 3 onglets et animation iOS
 */
export default function BottomNav() {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('planb_token');
  
  const tabs = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/publish', icon: PlusCircle, label: 'Publier' },
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
      <div className="bg-white/40 backdrop-blur-2xl border-t border-white/30">
        <div className="max-w-md mx-auto flex items-center justify-around px-4 py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            
            return (
              <Link
                key={tab.path}
                to={tab.path}
                state={{ fromNav: true }}
                className={`
                  flex flex-col items-center gap-1 transition-all duration-200
                  ${active ? 'text-primary-500 scale-110' : 'text-secondary-500'}
                `}
              >
                <div className={`
                  ${tab.path === '/publish' ? 'p-3 rounded-full' : ''}
                  ${tab.path === '/publish' && active ? 'bg-primary-500' : ''}
                  ${tab.path === '/publish' && !active ? 'bg-secondary-200' : ''}
                `}>
                  <Icon 
                    size={24} 
                    className={
                      active && tab.path !== '/publish' ? 'fill-primary-500' : 
                      tab.path === '/publish' && active ? 'text-white' :
                      tab.path === '/publish' ? 'text-secondary-600' : ''
                    }
                  />
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
