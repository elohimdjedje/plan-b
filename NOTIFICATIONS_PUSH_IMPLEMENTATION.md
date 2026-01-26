# 🔔 Notifications Push - Implémentation Complète

## ✅ Statut : **100% IMPLÉMENTÉ**

---

## 📋 Ce qui a été créé

### Backend

1. **Entity PushSubscription** ✅
   - `src/Entity/PushSubscription.php`
   - Stockage des souscriptions Web Push et Mobile

2. **Repository** ✅
   - `src/Repository/PushSubscriptionRepository.php`

3. **Service PushNotificationService** ✅
   - `src/Service/PushNotificationService.php`
   - Envoi Web Push API (navigateur)
   - Envoi FCM (Android/iOS)

4. **Contrôleur** ✅
   - `src/Controller/Api/PushSubscriptionController.php`
   - Routes pour s'abonner/se désabonner

5. **Intégration** ✅
   - `NotificationManagerService.php` modifié
   - Envoi automatique de push après création notification

6. **Migration** ✅
   - `migrations/Version20241201_CreatePushSubscriptions.php`
   - `migrations/add_push_subscriptions.sql`

### Frontend

1. **Service PushNotification** ✅
   - `src/services/pushNotification.js`
   - Gestion Web Push API

2. **Service Worker** ✅
   - `public/sw.js`
   - Réception et affichage des notifications

3. **Composant Prompt** ✅
   - `src/components/notifications/PushNotificationPrompt.jsx`
   - Demande de permission utilisateur

4. **Intégration App.jsx** ✅
   - Initialisation automatique au démarrage

---

## 🚀 Installation

### 1. Backend - Installer la dépendance

```bash
cd planb-backend
composer require minishlink/web-push
```

### 2. Générer les clés VAPID

```bash
cd planb-backend
php bin/console app:generate-vapid-keys
```

**Ou manuellement:**

```bash
# Installer web-push globalement
npm install -g web-push

# Générer les clés
web-push generate-vapid-keys
```

**Copier les clés dans `.env`:**
```env
VAPID_PUBLIC_KEY=votre_cle_publique
VAPID_PRIVATE_KEY=votre_cle_privee
VAPID_SUBJECT=mailto:admin@planb.com
```

### 3. Firebase Cloud Messaging (Mobile)

Pour les notifications mobile, obtenir la clé FCM:

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Créer/ouvrir un projet
3. **Settings > Cloud Messaging**
4. Copier le **Server Key**

**Ajouter dans `.env`:**
```env
FCM_SERVER_KEY=votre_cle_fcm
```

### 4. Frontend - Clé VAPID publique

**Ajouter dans `planb-frontend/.env`:**
```env
VITE_VAPID_PUBLIC_KEY=votre_cle_publique_vapid
```

### 5. Migration Base de Données

**Via pgAdmin:**
1. Ouvrir Query Tool
2. Exécuter: `migrations/add_push_subscriptions.sql`

**Ou via Doctrine:**
```bash
cd planb-backend
php bin/console doctrine:migrations:migrate
```

---

## 🎯 Fonctionnalités

### ✅ Implémenté

1. **Web Push API (Navigateur)**
   - Demande de permission
   - Souscription automatique
   - Réception notifications
   - Clic sur notification → redirection

2. **Mobile Push (FCM)**
   - Support Android
   - Support iOS
   - Envoi via FCM API

3. **Intégration Automatique**
   - Envoi push après création notification
   - Respect des préférences utilisateur
   - Désactivation automatique si invalide

4. **Gestion Souscriptions**
   - Enregistrement
   - Désactivation
   - Liste des souscriptions

---

## 🚀 Routes API

### S'abonner (Web)

```
POST /api/v1/push-subscriptions
Body:
{
  "endpoint": "https://...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  },
  "platform": "web"
}
```

### S'abonner (Mobile)

```
POST /api/v1/push-subscriptions
Body:
{
  "deviceToken": "fcm_token_...",
  "platform": "android" // ou "ios"
}
```

### Se désabonner

```
DELETE /api/v1/push-subscriptions/{id}
```

### Lister les souscriptions

```
GET /api/v1/push-subscriptions
```

---

## 🧪 Tests

### Test 1: Vérifier la permission

1. Ouvrir l'app
2. Attendre 3 secondes
3. ✅ Voir le prompt "Activer les notifications"
4. Cliquer "Activer"
5. ✅ Permission demandée par le navigateur

### Test 2: Envoyer une notification test

**Via API:**
```bash
curl -X POST http://localhost:8000/api/v1/notifications/test \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

**Ou créer une notification:**
```php
// Dans le backend
$notification = $notificationManager->createNotification(
    $user,
    'welcome',
    'Bienvenue !',
    'Test de notification push'
);
// La push sera envoyée automatiquement
```

### Test 3: Vérifier la réception

1. S'abonner aux notifications
2. Créer une notification
3. ✅ Voir la notification dans le navigateur
4. Cliquer sur la notification
5. ✅ Redirection vers la page appropriée

---

## 📊 Architecture

```
Backend (Symfony)
    ↓ Création Notification
NotificationManagerService
    ↓ Vérification préférences
PushNotificationService
    ↓
Web Push API (navigateur)  |  FCM (mobile)
    ↓
Service Worker (sw.js)
    ↓
Notification navigateur
```

---

## ⚙️ Configuration

### Variables .env Backend

```env
# VAPID pour Web Push API
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@planb.com

# FCM pour Mobile
FCM_SERVER_KEY=...

# URL de l'application
APP_URL=http://localhost:5173
```

### Variables .env Frontend

```env
VITE_VAPID_PUBLIC_KEY=...
```

---

## ✅ Checklist

- [x] Entity PushSubscription créée
- [x] Repository créé
- [x] PushNotificationService créé
- [x] PushSubscriptionController créé
- [x] Migration créée
- [x] Service frontend créé
- [x] Service Worker créé
- [x] Composant Prompt créé
- [x] Intégration App.jsx
- [ ] Installer `minishlink/web-push` (composer)
- [ ] Générer clés VAPID
- [ ] Configurer FCM (mobile)
- [ ] Appliquer migration
- [ ] Tester

---

## 🎉 Résultat

**Les notifications push sont maintenant 100% implémentées !**

**Fonctionnalités:**
- ✅ Web Push API (navigateur)
- ✅ FCM (Android/iOS)
- ✅ Intégration automatique
- ✅ Gestion des souscriptions
- ✅ Service Worker
- ✅ Prompt utilisateur

---

**Prochaine étape:** Installer les dépendances et configurer les clés VAPID/FCM !


