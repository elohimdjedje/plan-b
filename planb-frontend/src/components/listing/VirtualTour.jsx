import { useEffect, useRef, useState } from 'react';
import { Viewer } from 'photo-sphere-viewer';
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Composant de visite virtuelle 360°
 * Utilise Photo Sphere Viewer pour afficher les images panoramiques
 */
export default function VirtualTour({ 
  isOpen, 
  onClose, 
  imageUrl,
  thumbnailUrl 
}) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !containerRef.current) {
      // Nettoyer le viewer si on ferme
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {
          console.error('Erreur lors de la destruction du viewer:', e);
        }
        viewerRef.current = null;
      }
      setError(null);
      setLoading(true);
      return;
    }

    if (!imageUrl) {
      setError('Aucune image de visite virtuelle disponible.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Gérer les événements avec la méthode 'on' (API correcte de photo-sphere-viewer)
      const readyHandler = () => {
        setLoading(false);
      };

      const errorHandler = (e) => {
        console.error('Erreur viewer:', e);
        setError('Impossible de charger la visite virtuelle. Vérifiez que l\'image est au format panoramique 360°.');
        setLoading(false);
      };

      // Créer le viewer
      const viewer = new Viewer({
        container: containerRef.current,
        panorama: imageUrl,
        caption: 'Visite virtuelle 360°',
        navbar: [
          'zoom',
          'move',
          'download',
          'caption',
          'fullscreen'
        ],
        defaultZoomLvl: 30,
        minFov: 30,
        maxFov: 90,
        sphereCorrection: { pan: 0, tilt: 0, roll: 0 },
        loadingImg: undefined, // Pas d'image de chargement externe pour éviter CORS
        touchmoveTwoFingers: true,
        mousewheelCtrlKey: true,
      });

      viewerRef.current = viewer;

      // Attacher les event listeners
      viewer.on('ready', readyHandler);
      viewer.on('load-error', errorHandler);

      // Nettoyage
      return () => {
        if (viewerRef.current) {
          try {
            // Retirer les event listeners avant de détruire
            viewerRef.current.off('ready', readyHandler);
            viewerRef.current.off('load-error', errorHandler);
            viewerRef.current.destroy();
          } catch (e) {
            console.error('Erreur lors de la destruction du viewer:', e);
          }
          viewerRef.current = null;
        }
      };
    } catch (err) {
      console.error('Erreur lors de la création du viewer:', err);
      setError('Impossible de charger la visite virtuelle. Vérifiez que l\'image est au format panoramique 360°.');
      setLoading(false);
    }
  }, [isOpen, imageUrl]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        {/* Conteneur du viewer */}
        <div 
          ref={containerRef} 
          className="w-full h-full"
          style={{ position: 'relative' }}
        />

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full transition-all text-white"
          aria-label="Fermer"
        >
          <X size={24} />
        </button>

        {/* Instructions */}
        {!error && !loading && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm">
            <p>🖱️ Cliquez et glissez pour explorer • 🔍 Molette pour zoomer</p>
          </div>
        )}

        {/* Indicateur de chargement */}
        {loading && !error && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-sm">Chargement de la visite virtuelle...</p>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-red-500/90 backdrop-blur-sm px-6 py-4 rounded-lg text-white text-center max-w-md">
            <p className="font-semibold mb-2">⚠️ Erreur</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-red-500 rounded-lg font-medium hover:bg-gray-100"
            >
              Fermer
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}


