import { useState } from 'react';
import { MessageCircle, Phone, Mail, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../common/GlassCard';
import Button from '../common/Button';
import { listingsAPI } from '../../api/listings';

/**
 * Composant pour afficher les options de contact multi-canal
 * SMS, WhatsApp, Email, Appel téléphonique
 */
export default function ContactOptions({ seller, listing, onClose }) {
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Incrémenter le compteur de contacts
  const incrementContactCount = async () => {
    if (listing?.id) {
      try {
        await listingsAPI.incrementContacts(listing.id);
      } catch (error) {
        console.error('Erreur incrémentation contacts:', error);
      }
    }
  };

  const handleWhatsApp = () => {
    incrementContactCount();
    // Priorité: champ de l'annonce, sinon celui du vendeur
    const phone = listing?.contactWhatsapp || seller?.whatsappPhone || seller?.phone;
    if (!phone) return;

    const message = listing 
      ? `Bonjour, je suis intéressé(e) par votre annonce "${listing.title}" sur Plan B.`
      : `Bonjour, je souhaite vous contacter via Plan B.`;

    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCall = () => {
    incrementContactCount();
    // Priorité: champ de l'annonce, sinon celui du vendeur
    const phone = listing?.contactPhone || seller?.phone || seller?.whatsappPhone;
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };

  const handleSMS = () => {
    incrementContactCount();
    // Priorité: champ de l'annonce, sinon celui du vendeur
    const phone = listing?.contactPhone || seller?.phone || seller?.whatsappPhone;
    if (!phone) return;

    const message = listing 
      ? `Bonjour, je suis intéressé(e) par votre annonce "${listing.title}" sur Plan B.`
      : `Bonjour, je souhaite vous contacter via Plan B.`;

    window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
  };

  const handleEmail = () => {
    incrementContactCount();
    // Priorité: champ de l'annonce, sinon celui du vendeur
    const email = listing?.contactEmail || seller?.email;
    if (!email) return;

    const subject = listing 
      ? `Intéressé par: ${listing.title}`
      : 'Contact via Plan B';

    const body = listing 
      ? `Bonjour ${seller?.firstName || 'Vendeur'},\n\nJe suis intéressé(e) par votre annonce "${listing.title}" sur Plan B.\n\nCordialement,`
      : `Bonjour ${seller?.firstName || 'Vendeur'},\n\nJe souhaite vous contacter via Plan B.\n\nCordialement,`;

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const contactMethods = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      hoverBgColor: 'hover:bg-green-500/20',
      textColor: 'text-green-700',
      available: !!(listing?.contactWhatsapp || seller?.whatsappPhone || seller?.phone),
      action: handleWhatsApp,
      description: 'Discussion instantanée'
    },
    {
      id: 'call',
      label: 'Appeler',
      icon: Phone,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      hoverBgColor: 'hover:bg-blue-500/20',
      textColor: 'text-blue-700',
      available: !!(listing?.contactPhone || seller?.phone || seller?.whatsappPhone),
      action: handleCall,
      description: 'Appel direct'
    },
    {
      id: 'sms',
      label: 'SMS',
      icon: MessageSquare,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      hoverBgColor: 'hover:bg-purple-500/20',
      textColor: 'text-purple-700',
      available: !!(listing?.contactPhone || seller?.phone || seller?.whatsappPhone),
      action: handleSMS,
      description: 'Message texte'
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      hoverBgColor: 'hover:bg-orange-500/20',
      textColor: 'text-orange-700',
      available: !!(listing?.contactEmail || seller?.email),
      action: handleEmail,
      description: 'Message email'
    }
  ];

  const availableMethods = contactMethods.filter(method => method.available);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard className="bg-white/95 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-secondary-900">
                Contacter {seller.firstName || 'le vendeur'}
              </h3>
              <p className="text-sm text-secondary-600 mt-1">
                Choisissez votre moyen de contact préféré
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-secondary-600" />
            </button>
          </div>

          {/* Contact Methods - Aligned Row */}
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            {availableMethods.map((method) => {
              const Icon = method.icon;
              return (
                <motion.button
                  key={method.id}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={method.action}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${method.bgColor} ${method.borderColor} ${method.hoverBgColor} border transition-all duration-200`}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${method.gradient} shadow-md`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className={`text-xs font-medium ${method.textColor}`}>
                    {method.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Info */}
          {availableMethods.length === 0 && (
            <div className="text-center py-8">
              <p className="text-secondary-600">
                Aucun moyen de contact disponible pour ce vendeur.
              </p>
            </div>
          )}

          {/* Cancel Button */}
          <Button
            onClick={onClose}
            variant="outline"
            fullWidth
            className="mt-4"
          >
            Annuler
          </Button>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
