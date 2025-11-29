import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';
import Header from './Header';

/**
 * Container responsive avec animations iOS
 * Mobile-first, adapté tablet/desktop
 */
const pageVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.95,
    filter: "blur(10px)",
    y: 20
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0.0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    filter: "blur(10px)",
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

export default function MobileContainer({ 
  children, 
  showHeader = true,
  showNav = true,
  headerProps = {}
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50">
      {/* Header */}
      {showHeader && <Header {...headerProps} />}

      {/* Contenu principal avec animation */}
      <AnimatePresence mode="wait">
        <motion.main
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`
            ${showHeader ? 'pt-20 md:pt-24' : 'pt-4 md:pt-6'}
            ${showNav ? 'pb-24 md:pb-8' : 'pb-4 md:pb-6'}
            px-4 md:px-6 lg:px-8
            max-w-full sm:max-w-xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto
            min-h-screen
          `}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Bottom Navigation - Mobile only */}
      {showNav && <BottomNav />}
    </div>
  );
}
