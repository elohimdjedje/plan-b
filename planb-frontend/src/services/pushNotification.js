/**
 * Service pour gérer les notifications push (Web Push API)
 */
import axios from '../api/axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class PushNotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
    this.publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
  }

  /**
   * Initialiser le service de notifications push
   */
  async initialize() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      // Enregistrer le service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');

      // Vérifier si déjà abonné
      this.subscription = await this.registration.pushManager.getSubscription();
      
      if (this.subscription) {
        console.log('Already subscribed to push notifications');
        return true;
      }

      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  /**
   * Demander la permission et s'abonner
   */
  async subscribe() {
    if (!this.registration) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Push notifications not available');
      }
    }

    try {
      // Demander la permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      if (!this.publicKey) {
        throw new Error('VAPID public key not configured');
      }

      // S'abonner au service push
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.publicKey)
      });

      // Envoyer la souscription au backend
      const subscriptionData = {
        endpoint: this.subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(this.subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(this.subscription.getKey('auth'))
        },
        platform: 'web'
      };

      const response = await axios.post('/push-subscriptions', subscriptionData);

      if (response.data.success) {
        console.log('Push subscription registered');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  /**
   * Se désabonner
   */
  async unsubscribe() {
    if (this.subscription) {
      try {
        await this.subscription.unsubscribe();
        this.subscription = null;

        // Notifier le backend
        await axios.delete('/push-subscriptions');
        
        console.log('Unsubscribed from push notifications');
        return true;
      } catch (error) {
        console.error('Error unsubscribing:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Vérifier si l'utilisateur est abonné
   */
  async isSubscribed() {
    if (!this.registration) {
      await this.initialize();
    }

    if (this.registration) {
      this.subscription = await this.registration.pushManager.getSubscription();
      return this.subscription !== null;
    }

    return false;
  }

  /**
   * Vérifier la permission
   */
  getPermission() {
    if (!('Notification' in window)) {
      return 'not-supported';
    }
    return Notification.permission; // 'granted', 'denied', 'default'
  }

  /**
   * Convertir la clé publique VAPID en Uint8Array
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Convertir ArrayBuffer en Base64
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

// Instance singleton
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;


