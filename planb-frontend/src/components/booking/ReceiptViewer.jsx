import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, DollarSign, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { receiptsAPI } from '../../api/receipts';
import { formatPrice } from '../../utils/format';
import { toast } from 'react-hot-toast';

/**
 * Visualiseur de quittances
 */
export default function ReceiptViewer({ bookingId, onClose }) {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    loadReceipts();
  }, [bookingId]);

  const loadReceipts = async () => {
    if (!bookingId) return;
    
    setLoading(true);
    try {
      const data = await receiptsAPI.list(bookingId);
      setReceipts(data.data || []);
    } catch (error) {
      console.error('Erreur chargement quittances:', error);
      toast.error('Erreur lors du chargement des quittances');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (receipt) => {
    try {
      const data = await receiptsAPI.download(receipt.id);
      if (data.pdf_url) {
        window.open(data.pdf_url, '_blank');
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {receipts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucune quittance disponible</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {receipts.map(receipt => (
            <motion.div
              key={receipt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold mb-1">
                    Quittance #{receipt.receipt_number}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(receipt.period_start).toLocaleDateString()} - {new Date(receipt.period_end).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(receipt)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Loyer</span>
                  <span className="font-medium">{formatPrice(receipt.rent_amount)} XOF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Charges</span>
                  <span className="font-medium">{formatPrice(receipt.charges_amount)} XOF</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-orange-400">{formatPrice(receipt.total_amount)} XOF</span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Émise le {new Date(receipt.issued_at).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
