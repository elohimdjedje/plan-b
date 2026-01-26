/**
 * Ouvrir WhatsApp avec un message pré-rempli
 * @param {string} phoneNumber - Numéro de téléphone (format international)
 * @param {string} message - Message pré-rempli (optionnel)
 */
export const openWhatsApp = (phoneNumber, message = '') => {
  // Vérifier si le numéro existe
  if (!phoneNumber) {
    console.error('Numéro de téléphone manquant');
    return;
  }
  
  // Nettoyer le numéro (enlever espaces, tirets, etc.)
  const cleanedPhone = phoneNumber.replace(/[^0-9+]/g, '');
  
  // Message par défaut si non fourni
  const defaultMessage = message || 
    'Bonjour, je suis intéressé(e) par votre annonce sur Plan B.';
  
  // Encoder le message pour l'URL
  const encodedMessage = encodeURIComponent(defaultMessage);
  
  // Construire l'URL WhatsApp
  const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
  
  // Ouvrir dans un nouvel onglet
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};

/**
 * Créer un message personnalisé pour une annonce
 * @param {object} listing - Objet annonce
 * @returns {string} - Message formaté
 */
export const createListingMessage = (listing) => {
  return `Bonjour,

Je suis intéressé(e) par votre annonce "${listing.title}" au prix de ${listing.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA.

Pourriez-vous me donner plus d'informations ?

Merci.`;
};

/**
 * Vérifier si le numéro WhatsApp est valide
 * @param {string} phoneNumber - Numéro à vérifier
 * @returns {boolean} - True si valide
 */
export const isValidWhatsAppNumber = (phoneNumber) => {
  // Format international requis: +XXX...
  const cleaned = phoneNumber.replace(/[^0-9+]/g, '');
  return cleaned.startsWith('+') && cleaned.length >= 10 && cleaned.length <= 15;
};
