/**
 * Formater un prix en FCFA
 * @param {number} price - Prix en nombre
 * @returns {string} - Prix formaté (ex: "25 000 000")
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '0';
  // Convertir en nombre si c'est une string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '0';
  // Arrondir et formater
  return Math.round(numPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

/**
 * Formater une date relative (ex: "Il y a 2h")
 * @param {string|Date} date - Date à formater
 * @returns {string} - Date formatée
 */
export const formatRelativeDate = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return 'À l\'instant';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} min${diffInMinutes > 1 ? '' : ''}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Il y a ${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Il y a ${diffInDays}j`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `Il y a ${diffInWeeks} sem`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `Il y a ${diffInMonths} mois`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `Il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
};

/**
 * Formater un numéro de téléphone
 * @param {string} phone - Numéro de téléphone
 * @returns {string} - Numéro formaté
 */
export const formatPhone = (phone) => {
  // Enlever tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Format: +XXX XX XX XX XX XX
  if (cleaned.length >= 10) {
    const country = cleaned.substring(0, 3);
    const part1 = cleaned.substring(3, 5);
    const part2 = cleaned.substring(5, 7);
    const part3 = cleaned.substring(7, 9);
    const part4 = cleaned.substring(9, 11);
    return `+${country} ${part1} ${part2} ${part3} ${part4}`;
  }
  
  return phone;
};

/**
 * Tronquer un texte
 * @param {string} text - Texte à tronquer
 * @param {number} length - Longueur maximale
 * @returns {string} - Texte tronqué
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Obtenir l'initiale d'un nom
 * @param {string} name - Nom complet
 * @returns {string} - Initiales (ex: "JD")
 */
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
