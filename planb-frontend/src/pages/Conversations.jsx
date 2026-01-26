import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Trash2, Crown, Phone, Calendar, TrendingUp } from 'lucide-react';
import MobileContainer from '../components/layout/MobileContainer';
import GlassCard from '../components/common/GlassCard';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import { 
  getUserConversations, 
  deleteConversation, 
  clearAllConversations 
} from '../utils/conversations';
import { openWhatsApp } from '../utils/whatsapp';
import { formatRelativeDate } from '../utils/format';
import { toast } from 'react-hot-toast';

/**
 * Page d'historique des conversations WhatsApp
 * Affiche les profils des vendeurs contactés
 */
export default function Conversations() {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    const userConversations = getUserConversations();
    setConversations(userConversations);
  };

  const handleDelete = (conversationId) => {
    if (window.confirm('Supprimer cette conversation de l\'historique ?')) {
      deleteConversation(conversationId);
      loadConversations();
      toast.success('Conversation supprimée');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Supprimer tout l\'historique des conversations ?')) {
      clearAllConversations();
      loadConversations();
      toast.success('Historique effacé');
    }
  };

  const handleContact = (conversation) => {
    // Créer le message avec la dernière annonce contactée
    const message = conversation.lastListingTitle 
      ? `Bonjour, je suis intéressé par votre annonce "${conversation.lastListingTitle}"`
      : 'Bonjour, je souhaite discuter avec vous';
    
    openWhatsApp(conversation.sellerPhone, message);
  };

  return (
    <MobileContainer 
      headerProps={{ 
        showLogo: false, 
        title: 'Conversations',
        showBack: true 
      }}
    >
      <div className="space-y-4">
        {/* En-tête */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-secondary-900">Historique WhatsApp</h2>
              <p className="text-sm text-secondary-600">
                {conversations.length} vendeur{conversations.length > 1 ? 's' : ''} contacté{conversations.length > 1 ? 's' : ''}
              </p>
            </div>
            {conversations.length > 0 && (
              <button
                onClick={handleClearAll}
                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                title="Tout effacer"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </GlassCard>

        {/* Liste des conversations */}
        {conversations.length === 0 ? (
          <GlassCard className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center">
                <MessageCircle size={32} className="text-secondary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-secondary-900 mb-2">
                  Aucune conversation
                </h3>
                <p className="text-secondary-600 text-sm">
                  Vos conversations WhatsApp avec les vendeurs apparaîtront ici
                </p>
              </div>
            </div>
          </GlassCard>
        ) : (
          <AnimatePresence mode="popLayout">
            {conversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="hover:shadow-lg transition-shadow">
                  <div className="flex gap-3">
                    {/* Avatar vendeur */}
                    <Avatar 
                      name={conversation.sellerName} 
                      size="lg" 
                      className="flex-shrink-0"
                    />

                    {/* Infos vendeur */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-secondary-900 truncate">
                            {conversation.sellerName}
                          </h3>
                          {conversation.sellerAccountType === 'PRO' && (
                            <div className="flex items-center gap-1 mt-1">
                              <Crown size={14} className="text-yellow-500" />
                              <span className="text-xs text-yellow-600 font-medium">Vendeur PRO</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <button
                          onClick={() => handleDelete(conversation.id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex-shrink-0"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Dernière annonce contactée */}
                      {conversation.lastListingTitle && (
                        <div className="flex gap-2 mb-2">
                          {conversation.lastListingImage && (
                            <img 
                              src={conversation.lastListingImage} 
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-secondary-600">Dernière annonce :</p>
                            <p className="text-sm font-medium text-secondary-900 truncate">
                              {conversation.lastListingTitle}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Statistiques */}
                      <div className="flex items-center gap-3 text-xs text-secondary-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{formatRelativeDate(conversation.lastContactedAt)}</span>
                        </div>
                        {conversation.totalContacts > 1 && (
                          <div className="flex items-center gap-1">
                            <TrendingUp size={12} />
                            <span>{conversation.totalContacts} contacts</span>
                          </div>
                        )}
                      </div>

                      {/* Bouton WhatsApp */}
                      <button
                        onClick={() => handleContact(conversation)}
                        className="w-full bg-green-500/10 hover:bg-green-500/20 border-2 border-green-500/30 hover:border-green-500/50 text-green-700 font-semibold py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={18} />
                        <span>Continuer sur WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Info */}
        <GlassCard className="bg-green-50/50 border-green-200">
          <div className="flex gap-3">
            <MessageCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-1">À propos de l'historique</h4>
              <p className="text-sm text-green-700">
                Cet historique sauvegarde automatiquement les profils des vendeurs que vous contactez via WhatsApp. Cliquez sur une conversation pour relancer la discussion.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </MobileContainer>
  );
}
