import { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { reportAPI } from '../../api/report';

const REASONS = [
  { value: 'scam', label: 'Arnaque / Fraude' },
  { value: 'inappropriate', label: 'Contenu inapproprié' },
  { value: 'duplicate', label: 'Annonce en double' },
  { value: 'spam', label: 'Spam / Publicité' },
  { value: 'false_info', label: 'Informations fausses' },
  { value: 'other', label: 'Autre' },
];

export default function ReportButton({ listingId, onReported }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Veuillez sélectionner une raison');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await reportAPI.create({
        listingId,
        reason,
        description: description.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setReason('');
        setDescription('');
        if (onReported) onReported();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du signalement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
        title="Signaler cette annonce"
      >
        <Flag size={16} />
        <span>Signaler</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => !loading && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Signaler cette annonce
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Flag className="text-green-600" size={32} />
                  </div>
                  <p className="text-green-600 font-medium">
                    Signalement enregistré !
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Notre équipe va examiner cette annonce.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison du signalement *
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="">Sélectionner une raison</option>
                      {REASONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (optionnel)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      maxLength={1000}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Décrivez le problème..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {description.length}/1000 caractères
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !reason}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Envoi...' : 'Signaler'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


