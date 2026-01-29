import { useState } from 'react';
import { ChevronDown, ChevronUp, Smartphone, Camera, CheckCircle, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Composant tutoriel pour créer une photo 360°
 * Affiche un guide complet pour les propriétaires
 */
export default function VirtualTourTutorial({ isOpen, onClose }) {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-orange-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">📸 Tuto : Photo 360° en 5 minutes</h2>
              <p className="text-white/90 text-sm">Guide simple pour créer votre visite virtuelle</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Méthode Facile - Smartphone */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('smartphone')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="text-blue-600" size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">📱 Méthode Facile (Smartphone)</h3>
                    <p className="text-sm text-gray-600">Recommandé pour débuter</p>
                  </div>
                </div>
                {expandedSection === 'smartphone' ? (
                  <ChevronUp className="text-gray-400" size={20} />
                ) : (
                  <ChevronDown className="text-gray-400" size={20} />
                )}
              </button>

              <AnimatePresence>
                {expandedSection === 'smartphone' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-4 bg-gray-50">
                      {/* Étape 1 */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            1
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">Télécharge l'app</h4>
                            <ul className="space-y-1 text-sm text-gray-700">
                              <li className="flex items-center gap-2">
                                <CheckCircle className="text-green-500" size={16} />
                                <strong>Google Street View</strong> (gratuit)
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="text-green-500" size={16} />
                                Disponible sur iOS et Android
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Étape 2 */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            2
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">Prends ta photo</h4>
                            <ol className="space-y-1 text-sm text-gray-700 list-decimal list-inside">
                              <li>Ouvre l'app</li>
                              <li>Appuie sur le bouton 📷 en bas</li>
                              <li>Choisis "Photo 360°"</li>
                              <li>Suis les points orange à l'écran</li>
                              <li>Tourne sur toi-même lentement</li>
                              <li>L'app assemble automatiquement</li>
                            </ol>
                          </div>
                        </div>
                      </div>

                      {/* Étape 3 */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            3
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">Exporte</h4>
                            <ol className="space-y-1 text-sm text-gray-700 list-decimal list-inside">
                              <li>Ouvre ta photo</li>
                              <li>Menu ⋮ → "Exporter"</li>
                              <li>Choisis "Équirectangulaire"</li>
                              <li>C'est prêt ! ✅</li>
                            </ol>
                            <p className="mt-2 text-xs text-gray-600 italic">
                              <strong>Résultat :</strong> Une image rectangulaire très large (2x plus large que haute)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Méthode Pro - Caméra 360° */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('camera')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Camera className="text-purple-600" size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">📷 Méthode Pro (Caméra 360°)</h3>
                    <p className="text-sm text-gray-600">Pour une qualité professionnelle</p>
                  </div>
                </div>
                {expandedSection === 'camera' ? (
                  <ChevronUp className="text-gray-400" size={20} />
                ) : (
                  <ChevronDown className="text-gray-400" size={20} />
                )}
              </button>

              <AnimatePresence>
                {expandedSection === 'camera' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-4 bg-gray-50">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold mb-3">Caméras recommandées :</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="text-green-500" size={16} />
                            <strong>Insta360 ONE X2</strong> (~300€) ⭐
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="text-green-500" size={16} />
                            <strong>Ricoh Theta SC2</strong> (~250€)
                          </li>
                        </ul>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold mb-2">Utilisation :</h4>
                        <ol className="space-y-1 text-sm text-gray-700 list-decimal list-inside">
                          <li>Allume la caméra</li>
                          <li>Appuie sur le bouton photo</li>
                          <li>Attends 3 secondes</li>
                          <li>Transfère sur ton téléphone</li>
                          <li>La photo est déjà en format 360° ! ✅</li>
                        </ol>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Vérification */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                Vérification rapide
              </h3>
              <p className="text-sm text-gray-700 mb-3">Ton image est bonne si :</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  Largeur = 2x la hauteur
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  Le haut et le bas sont très étirés
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  Ça ressemble à une carte du monde
                </li>
              </ul>
              <a
                href="https://pannellum.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Tester en ligne <ExternalLink size={16} />
              </a>
            </div>

          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              J'ai compris, merci !
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
