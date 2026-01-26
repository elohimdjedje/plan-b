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

  useEffect(() => {
    if (!isOpen || !containerRef.current || !imageUrl) return;

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
      loadingImg: 'https://photo-sphere-viewer.js.org/assets/photosphere-logo.gif',
      touchmoveTwoFingers: true,
      mousewheelCtrlKey: true,
    });

    viewerRef.current = viewer;

    // Nettoyage
    return () => {
      if (viewer) {
        viewer.destroy();
      }
    };
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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm">
          <p>🖱️ Cliquez et glissez pour explorer • 🔍 Molette pour zoomer</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}


