/**
 * Système de gestion des notifications
 * Suit les changements de statut des annonces favorites
 */

// Clés localStorage
const NOTIFICATIONS_KEY = 'planb_notifications';
const FAVORITES_KEY = 'planb_favorites';
const FAVORITES_SNAPSHOT_KEY = 'planb_favorites_snapshot';

/**
 * Obtenir l'utilisateur actuel depuis le store (synchrone, sans API)
 */
const getCurrentUserSync = () => {
  if (typeof window !== 'undefined' && window.useAuthStore) {
    return window.useAuthStore.getState().user;
  }
  return null;
};

/**
 * Obtenir toutes les notifications
 */
export const getNotifications = () => {
  try {
    const notifications = localStorage.getItem(NOTIFICATIONS_KEY);
    return notifications ? JSON.parse(notifications) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return [];
  }
};

/**
 * Sauvegarder les notifications
 */
const saveNotifications = (notifications) => {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des notifications:', error);
  }
};

/**
 * Créer une nouvelle notification
 */
export const createNotification = (type, listingId, listingTitle, oldStatus, newStatus) => {
  const currentUser = getCurrentUserSync();
  if (!currentUser) return;

  const notifications = getNotifications();
  
  const notification = {
    id: Date.now().toString(),
    userId: currentUser.id,
    type, // 'status_change', 'deleted', 'price_change', etc.
    listingId,
    listingTitle,
    oldStatus,
    newStatus,
    message: generateNotificationMessage(type, listingTitle, oldStatus, newStatus),
    read: false,
    createdAt: new Date().toISOString()
  };

  notifications.unshift(notification); // Ajouter au début
  saveNotifications(notifications);
  
  return notification;
};

/**
 * Générer le message de notification
 */
const generateNotificationMessage = (type, listingTitle, oldStatus, newStatus) => {
  switch (type) {
    case 'status_change':
      if (newStatus === 'sold') {
        return `"${listingTitle}" a été marquée comme vendue/occupée`;
      }
      if (newStatus === 'expired') {
        return `"${listingTitle}" a expiré`;
      }
      if (newStatus === 'active' && oldStatus === 'expired') {
        return `"${listingTitle}" a été republiée`;
      }
      return `Le statut de "${listingTitle}" a changé`;
    
    case 'deleted':
      return `"${listingTitle}" a été supprimée par le vendeur`;
    
    case 'price_change':
      return `Le prix de "${listingTitle}" a été modifié`;
    
    default:
      return `Mise à jour pour "${listingTitle}"`;
  }
};

/**
 * Marquer une notification comme lue
 */
export const markNotificationAsRead = (notificationId) => {
  const notifications = getNotifications();
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  saveNotifications(updated);
};

/**
 * Marquer toutes les notifications comme lues
 */
export const markAllNotificationsAsRead = () => {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
};

/**
 * Supprimer une notification
 */
export const deleteNotification = (notificationId) => {
  const notifications = getNotifications();
  const filtered = notifications.filter(n => n.id !== notificationId);
  saveNotifications(filtered);
};

/**
 * Supprimer toutes les notifications
 */
export const clearAllNotifications = () => {
  saveNotifications([]);
};

/**
 * Obtenir le nombre de notifications non lues
 */
export const getUnreadNotificationsCount = () => {
  const currentUser = getCurrentUserSync();
  if (!currentUser) return 0;
  
  const notifications = getNotifications();
  return notifications.filter(n => n.userId === currentUser.id && !n.read).length;
};

/**
 * Obtenir les notifications de l'utilisateur actuel
 */
export const getUserNotifications = () => {
  const currentUser = getCurrentUserSync();
  if (!currentUser) return [];
  
  const notifications = getNotifications();
  return notifications.filter(n => n.userId === currentUser.id);
};

/**
 * Obtenir les favoris
 */
export const getFavorites = () => {
  try {
    const currentUser = getCurrentUserSync();
    if (!currentUser) return [];
    
    const favorites = localStorage.getItem(FAVORITES_KEY);
    const allFavorites = favorites ? JSON.parse(favorites) : {};
    return allFavorites[currentUser.id] || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des favoris:', error);
    return [];
  }
};

/**
 * Sauvegarder un snapshot des annonces favorites
 */
export const saveFavoritesSnapshot = (listingsData) => {
  try {
    const currentUser = getCurrentUserSync();
    if (!currentUser) return;
    
    const snapshots = localStorage.getItem(FAVORITES_SNAPSHOT_KEY);
    const allSnapshots = snapshots ? JSON.parse(snapshots) : {};
    
    allSnapshots[currentUser.id] = listingsData;
    localStorage.setItem(FAVORITES_SNAPSHOT_KEY, JSON.stringify(allSnapshots));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du snapshot:', error);
  }
};

/**
 * Obtenir le snapshot des favoris
 */
export const getFavoritesSnapshot = () => {
  try {
    const currentUser = getCurrentUserSync();
    if (!currentUser) return {};
    
    const snapshots = localStorage.getItem(FAVORITES_SNAPSHOT_KEY);
    const allSnapshots = snapshots ? JSON.parse(snapshots) : {};
    return allSnapshots[currentUser.id] || {};
  } catch (error) {
    console.error('Erreur lors de la récupération du snapshot:', error);
    return {};
  }
};

/**
 * Vérifier les changements dans les annonces favorites
 * À appeler régulièrement ou lors du chargement de l'app
 */
export const checkFavoritesChanges = (currentListings) => {
  const currentUser = getCurrentUserSync();
  if (!currentUser) return;
  
  const favorites = getFavorites();
  if (favorites.length === 0) return;
  
  const snapshot = getFavoritesSnapshot();
  const newSnapshot = {};
  
  favorites.forEach(listingId => {
    const listing = currentListings.find(l => String(l.id) === String(listingId));
    
    if (!listing) {
      // Annonce supprimée
      const oldListing = snapshot[listingId];
      if (oldListing) {
        createNotification('deleted', listingId, oldListing.title, oldListing.status, null);
      }
    } else {
      // Vérifier les changements de statut
      const oldListing = snapshot[listingId];
      if (oldListing && oldListing.status !== listing.status) {
        createNotification('status_change', listing.id, listing.title, oldListing.status, listing.status);
      }
      
      // Vérifier les changements de prix
      if (oldListing && oldListing.price !== listing.price) {
        createNotification('price_change', listing.id, listing.title, oldListing.price, listing.price);
      }
      
      // Sauvegarder l'état actuel
      newSnapshot[listingId] = {
        id: listing.id,
        title: listing.title,
        status: listing.status,
        price: listing.price
      };
    }
  });
  
  // Sauvegarder le nouveau snapshot
  saveFavoritesSnapshot(newSnapshot);
};
