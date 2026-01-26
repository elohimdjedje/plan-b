import React, { useState, useRef } from 'react';
import { Image as ImageIcon, X, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

/**
 * Composant d'upload d'images pour la messagerie
 * Support drag & drop et preview
 */
const ImageUploader = ({ onImageSelect, maxSize = 5, multiple = false }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Taille max en Mo
  const maxSizeBytes = maxSize * 1024 * 1024;

  /**
   * Valider un fichier
   */
  const validateFile = (file) => {
    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      toast.error('Seules les images sont acceptées');
      return false;
    }

    // Vérifier la taille
    if (file.size > maxSizeBytes) {
      toast.error(`L'image ne doit pas dépasser ${maxSize} Mo`);
      return false;
    }

    return true;
  };

  /**
   * Gérer la sélection de fichiers
   */
  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(validateFile);

    if (validFiles.length === 0) return;

    // Limiter à 1 si multiple = false
    const filesToProcess = multiple ? validFiles : [validFiles[0]];

    // Créer les previews
    const previews = filesToProcess.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36),
    }));

    if (multiple) {
      setSelectedImages((prev) => [...prev, ...previews]);
    } else {
      setSelectedImages(previews);
    }

    // Notifier le parent
    onImageSelect?.(filesToProcess);
  };

  /**
   * Gérer le drop
   */
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  /**
   * Gérer le drag over
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  /**
   * Gérer le drag leave
   */
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  /**
   * Retirer une image
   */
  const removeImage = (id) => {
    setSelectedImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      
      // Libérer la mémoire
      const removed = prev.find((img) => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }

      return updated;
    });
  };

  /**
   * Ouvrir le sélecteur de fichiers
   */
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Zone de drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileSelector}
        className={`
          border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            {uploading ? (
              <Loader2 size={24} className="animate-spin text-orange-500" />
            ) : (
              <ImageIcon size={24} className="text-gray-400" />
            )}
          </div>

          <div>
            <p className="font-medium text-gray-900">
              {isDragging ? 'Déposez l\'image ici' : 'Ajouter une image'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Cliquez ou glissez-déposez (max {maxSize} Mo)
            </p>
          </div>

          <Upload size={20} className="text-gray-400" />
        </div>
      </div>

      {/* Preview des images sélectionnées */}
      <AnimatePresence>
        {selectedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            {selectedImages.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                {/* Image */}
                <img
                  src={image.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>

                {/* Nom du fichier */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                  <p className="text-xs text-white truncate">
                    {image.file.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;
