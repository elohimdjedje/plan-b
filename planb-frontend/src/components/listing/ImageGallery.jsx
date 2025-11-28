import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Galerie d'images avec swipe et mode plein écran
 */
export default function ImageGallery({ images, listing }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* Galerie scrollable - Hauteur adaptée */}
      <div className="relative h-64 md:h-96 lg:h-[32rem]">
        <div className="overflow-x-auto snap-x snap-mandatory flex h-full scrollbar-hide">
          {images.map((image, index) => (
            <motion.div
              key={index}
              className="min-w-full h-full snap-center relative"
              onClick={() => {
                setCurrentIndex(index);
                setIsFullscreen(true);
              }}
            >
              <img
                src={image.url}
                alt={`${listing.title} ${index + 1}`}
                className="w-full h-full object-contain cursor-pointer"
              />
            </motion.div>
          ))}
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        
        {/* Indicateurs de pagination */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Compteur d'images */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Mode plein écran (Lightbox) */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            {/* Bouton fermer */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(false);
              }}
              className="absolute top-4 right-4 z-50 p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={24} className="text-white" />
            </button>

            {/* Compteur */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white font-medium">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Image actuelle */}
            <motion.img
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              src={images[currentIndex].url}
              alt={`${listing.title} ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Boutons de navigation - Apparaissent au survol */}
            {images.length > 1 && (
              <>
                {/* Zone de survol gauche */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1/4 z-10 cursor-pointer"
                  onMouseEnter={() => setShowLeftArrow(true)}
                  onMouseLeave={() => setShowLeftArrow(false)}
                  onClick={goToPrevious}
                >
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: showLeftArrow ? 1 : 0, x: showLeftArrow ? 0 : -20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors pointer-events-none"
                  >
                    <ChevronLeft size={32} className="text-white" />
                  </motion.button>
                </div>

                {/* Zone de survol droite */}
                <div
                  className="absolute right-0 top-20 bottom-0 w-1/4 z-10 cursor-pointer"
                  onMouseEnter={() => setShowRightArrow(true)}
                  onMouseLeave={() => setShowRightArrow(false)}
                  onClick={goToNext}
                >
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: showRightArrow ? 1 : 0, x: showRightArrow ? 0 : 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors pointer-events-none"
                  >
                    <ChevronRight size={32} className="text-white" />
                  </motion.button>
                </div>
              </>
            )}

            {/* Miniatures en bas */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex ? 'border-white scale-110' : 'border-white/30 opacity-60'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`Miniature ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
