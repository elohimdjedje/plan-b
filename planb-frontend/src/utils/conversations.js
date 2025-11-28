/**
 * Système de gestion de l'historique des conversations WhatsApp
 * Sauvegarde les profils des vendeurs contactés
 */

const CONVERSATIONS_KEY = 'planb_conversations';

/**
 * Obtenir l'ID utilisateur depuis localStorage (synchrone)
 */
const getCurrentUserId = () => {
  try {
    // Méthode 1 : Via le store Zustand global (prioritaire)
    if (typeof window !== 'undefined' && window.useAuthStore) {
      const storeState = window.useAuthStore.getState();
      if (storeState?.user?.id) {
        console.log('✅ [Conversations] User ID depuis store:', storeState.user.id);
        return storeState.user.id;
      }
    }

    // Méthode 2 : Via localStorage - Zustand persist
    const authStorage = localStorage.getItem('planb-auth-storage');
    console.log('🔍 [Conversations] Auth storage brut:', authStorage?.substring(0, 100));
    
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      
      // Essayer différentes structures possibles
      let userId = null;
      
      // Structure 1 : { state: { user: { id } } }
      if (parsed.state?.user?.id) {
        userId = parsed.state.user.id;
      }
      // Structure 2 : { user: { id } }
      else if (parsed.user?.id) {
        userId = parsed.user.id;
      }
      // Structure 3 : Direct ID
      else if (parsed.id) {
        userId = parsed.id;
      }
      
      if (userId) {
        console.log('✅ [Conversations] User ID depuis localStorage:', userId);
        return userId;
      }
    }
    
    // Méthode 3 : Clé alternative 'user'
    const userStorage = localStorage.getItem('user');
    if (userStorage) {
      const user = JSON.parse(userStorage);
      if (user?.id) {
        console.log('✅ [Conversations] User ID depuis clé user:', user.id);
        return user.id;
      }
    }
    
    console.warn('⚠️ [Conversations] Aucun user ID trouvé');
    return null;
  } catch (error) {
    console.error('❌ [Conversations] Erreur récupération user ID:', error);
    return null;
  }
};

/**
 * Obtenir toutes les conversations
 */
const getAllConversations = () => {
  try {
    const conversations = localStorage.getItem(CONVERSATIONS_KEY);
    return conversations ? JSON.parse(conversations) : {};
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    return {};
  }
};

/**
 * Sauvegarder les conversations
 */
const saveConversations = (conversations) => {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des conversations:', error);
  }
};

/**
 * Sauvegarder une conversation
 * Appelé quand l'utilisateur clique sur "Discuter sur WhatsApp"
 * @param {Object} sellerInfo - Informations du vendeur
 * @param {Object} listingInfo - Informations de l'annonce
 * @param {number|string} [currentUserId] - ID de l'utilisateur (optionnel, si déjà connu)
 */
export const saveConversation = (sellerInfo, listingInfo, currentUserId = null) => {
  console.log('💾 [Conversations] saveConversation appelée');
  console.log('💾 [Conversations] Seller info:', sellerInfo);
  console.log('💾 [Conversations] Listing info:', listingInfo);
  console.log('💾 [Conversations] User ID fourni:', currentUserId);
  
  const userId = currentUserId || getCurrentUserId();
  console.log('💾 [Conversations] User ID final:', userId);
  
  if (!userId) {
    console.error('❌ [Conversations] Impossible de sauvegarder: pas de user ID');
    console.error('❌ [Conversations] Essayez de passer l\'ID utilisateur en paramètre');
    return null;
  }

  const allConversations = getAllConversations();
  const userConversations = allConversations[userId] || [];

  // Créer ou mettre à jour la conversation
  const conversationIndex = userConversations.findIndex(
    conv => conv.sellerId === sellerInfo.id
  );

  const conversation = {
    id: `${userId}-${sellerInfo.id}-${Date.now()}`,
    sellerId: sellerInfo.id,
    sellerName: sellerInfo.name,
    sellerPhone: sellerInfo.phone,
    sellerAccountType: sellerInfo.accountType || 'FREE',
    sellerMemberSince: sellerInfo.memberSince,
    lastListingId: listingInfo?.id,
    lastListingTitle: listingInfo?.title,
    lastListingImage: listingInfo?.image,
    lastContactedAt: new Date().toISOString(),
    totalContacts: 1
  };

  if (conversationIndex !== -1) {
    // Mettre à jour la conversation existante
    console.log('🔄 [Conversations] Mise à jour d\'une conversation existante');
    const existingConv = userConversations[conversationIndex];
    conversation.totalContacts = (existingConv.totalContacts || 0) + 1;
    conversation.id = existingConv.id; // Garder l'ID original
    userConversations[conversationIndex] = conversation;
  } else {
    // Ajouter nouvelle conversation au début
    console.log('➕ [Conversations] Ajout d\'une nouvelle conversation');
    userConversations.unshift(conversation);
  }

  // Sauvegarder
  console.log('💾 [Conversations] Sauvegarde des conversations');
  console.log('💾 [Conversations] User ID:', userId);
  console.log('💾 [Conversations] Conversations à sauvegarder:', userConversations);
  
  allConversations[userId] = userConversations;
  saveConversations(allConversations);
  
  console.log('✅ [Conversations] Conversation sauvegardée avec succès');

  return conversation;
};

/**
 * Obtenir les conversations de l'utilisateur actuel
 */
export const getUserConversations = () => {
  console.log('📖 [Conversations] getUserConversations appelée');
  
  const userId = getCurrentUserId();
  console.log('📖 [Conversations] User ID récupéré:', userId);
  
  if (!userId) {
    console.warn('⚠️ [Conversations] Pas de user ID, retour tableau vide');
    return [];
  }

  const allConversations = getAllConversations();
  console.log('📖 [Conversations] Toutes les conversations:', allConversations);
  
  const userConversations = allConversations[userId] || [];
  console.log('📖 [Conversations] Conversations de l\'utilisateur:', userConversations);
  
  return userConversations;
};

/**
 * Obtenir une conversation spécifique
 */
export const getConversation = (sellerId) => {
  const conversations = getUserConversations();
  return conversations.find(conv => conv.sellerId === sellerId);
};

/**
 * Supprimer une conversation
 */
export const deleteConversation = (conversationId) => {
  const userId = getCurrentUserId();
  if (!userId) return;

  const allConversations = getAllConversations();
  const userConversations = allConversations[userId] || [];

  const filtered = userConversations.filter(conv => conv.id !== conversationId);
  allConversations[userId] = filtered;
  saveConversations(allConversations);
};

/**
 * Supprimer toutes les conversations
 */
export const clearAllConversations = () => {
  const userId = getCurrentUserId();
  if (!userId) return;

  const allConversations = getAllConversations();
  allConversations[userId] = [];
  saveConversations(allConversations);
};

/**
 * Obtenir le nombre de conversations
 */
export const getConversationsCount = () => {
  const conversations = getUserConversations();
  return conversations.length;
};
