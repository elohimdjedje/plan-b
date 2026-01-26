import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, FileText, AlertTriangle, ArrowRight, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

/**
 * Modal affichée quand l'utilisateur FREE atteint sa limite d'annonces
 * Propose de passer PRO ou de sauvegarder en brouillon
 */
export default function QuotaExceededModal({ 
  isOpen, 
  onClose, 
  currentListings = 4, 
  maxListings = 4,
  onSaveDraft,
  onUpgrade 
}) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    // Sauvegarder en brouillon d'abord, puis rediriger vers le paiement
    if (onSaveDraft) {
      setSaving(true);
      onSaveDraft().then(() => {
        setSaving(false);
        onClose();
        navigate('/upgrade-plan');
      }).catch(() => {
        setSaving(false);
      });
    } else {
      onClose();
      navigate('/upgrade-plan');
    }
  };

  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      setSaving(true);
      try {
        await onSaveDraft();
        onClose();
        navigate('/profile?tab=drafts');
      } catch (error) {
        console.error('Erreur sauvegarde brouillon:', error);
      } finally {
        setSaving(false);
      }
    }
  };

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
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* En-tête avec icône d'alerte */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Limite d'annonces atteinte
            </h2>
          </div>

          {/* Contenu */}
          <div className="p-6 space-y-4">
            {/* Message explicatif */}
            <div className="text-center">
              <p className="text-gray-700 mb-2">
                Vous avez atteint la limite de <span className="font-bold text-orange-600">{currentListings}/{maxListings} annonces</span> pour les comptes gratuits.
              </p>
              <p className="text-gray-500 text-sm">
                Pour publier plus d'annonces, passez au compte PRO ou sauvegardez votre annonce en brouillon.
              </p>
            </div>

            {/* Comparaison FREE vs PRO */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">FREE</span>
                  </div>
                  <span className="text-sm text-gray-600">Compte Gratuit</span>
                </div>
                <span className="text-sm font-medium text-gray-500">4 annonces max</span>
              </div>
              
              <div className="border-t border-gray-200"></div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Crown size={14} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">Compte PRO</span>
                </div>
                <span className="text-sm font-bold text-green-600">Illimité ✨</span>
              </div>
            </div>

            {/* Avantages PRO */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <Crown size={16} className="text-amber-600" />
                Avantages du compte PRO
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>✅ Annonces illimitées</li>
                <li>✅ Mise en avant prioritaire</li>
                <li>✅ Badge PRO vérifié</li>
                <li>✅ Durée de publication 60 jours</li>
                <li>✅ Support prioritaire</li>
              </ul>
            </div>

            {/* Note sur le brouillon */}
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
              <p className="text-xs text-blue-700 flex items-start gap-2">
                <Save size={14} className="flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Brouillon :</strong> Votre annonce sera sauvegardée et vous pourrez la publier après avoir passé en PRO depuis votre profil.
                </span>
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="p-6 pt-0 space-y-3">
            {/* Bouton principal : Passer PRO */}
            <Button
              onClick={handleUpgrade}
              disabled={saving}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              <Crown size={18} />
              {saving ? 'Sauvegarde...' : 'Passer PRO maintenant'}
              <ArrowRight size={18} />
            </Button>

            {/* Bouton secondaire : Sauvegarder en brouillon */}
            <Button
              onClick={handleSaveDraft}
              disabled={saving}
              variant="outline"
              className="w-full border-2 border-gray-300 text-gray-700 font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <FileText size={18} />
              {saving ? 'Sauvegarde...' : 'Sauvegarder en brouillon'}
            </Button>

            {/* Lien pour fermer */}
            <button
              onClick={onClose}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
            >
              Annuler
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
