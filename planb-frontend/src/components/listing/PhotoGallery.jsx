import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

/**
 * Galerie de photos avec défilement et vue en grand
 */
export default function PhotoGallery({ images = [], initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const goToPrevious = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      {/* Galerie normale */}
      <div className="relative h-96 bg-secondary-900">
        {/* Image principale */}
        <div className="relative h-full">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]?.url}
              alt={`Photo ${currentIndex + 1}`}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={openFullscreen}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {/* Bouton zoom */}
          <button
            onClick={openFullscreen}
            className="absolute bottom-4 right-4 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full transition-colors"
          >
            <ZoomIn size={20} className="text-white" />
          </button>

          {/* Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>

        {/* Flèches de navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full transition-all"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full transition-all"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </>
        )}

        {/* Miniatures */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-white scale-110'
                    : 'border-white/30 hover:border-white/60'
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
        )}

        {/* Compteur */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Modal plein écran */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black"
            onClick={closeFullscreen}
          >
            {/* Bouton fermer */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
            >
              <X size={24} className="text-white" />
            </button>

            {/* Compteur */}
            <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white font-medium">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Image en plein écran */}
            <div className="relative h-full flex items-center justify-center p-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={images[currentIndex]?.url}
                  alt={`Photo ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                />
              </AnimatePresence>

              {/* Flèches de navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all"
                  >
                    <ChevronLeft size={32} className="text-white" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all"
                  >
                    <ChevronRight size={32} className="text-white" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
