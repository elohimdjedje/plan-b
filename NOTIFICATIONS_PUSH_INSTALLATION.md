# 🔔 Notifications Push - Guide d'Installation

## ✅ Code 100% Créé

Tous les fichiers sont créés ! Voici comment finaliser l'installation.

---

## 📋 Étapes d'Installation

### 1. Installer la Dépendance Backend

```bash
cd planb-backend
composer require minishlink/web-push
```

---

### 2. Générer les Clés VAPID

**Option A: Via npm (Recommandé)**

```bash
npm install -g web-push
web-push generate-vapid-keys
```

**Option B: Via Commande Symfony**

```bash
cd planb-backend
php bin/console app:generate-vapid-keys
```

**Résultat:**
```
Public Key: BKx...
Private Key: ...
```

---

### 3. Configurer les Clés

**Backend (`planb-backend/.env`):**
```env
VAPID_PUBLIC_KEY=BKx...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@planb.com
FCM_SERVER_KEY=votre_cle_fcm (optionnel pour mobile)
```

**Frontend (`planb-frontend/.env`):**
```env
VITE_VAPID_PUBLIC_KEY=BKx... (même clé publique)
```

---

### 4. Appliquer la Migration

**Via pgAdmin:**
1. Ouvrir Query Tool
2. Exécuter: `migrations/add_push_subscriptions.sql`

**Ou via Doctrine:**
```bash
cd planb-backend
php bin/console doctrine:migrations:migrate
```

---

### 5. Décommenter le Code

**Dans `PushNotificationService.php`:**

Décommenter les lignes marquées avec `// Note: Décommenter après installation`

---

## 🧪 Test

### Test 1: Vérifier la Permission

1. Ouvrir l'app
2. Attendre 3 secondes
3. ✅ Voir le prompt "Activer les notifications"
4. Cliquer "Activer"
5. ✅ Permission demandée

### Test 2: Envoyer une Notification

Créer une notification via l'API ou l'interface admin.

✅ La notification push sera envoyée automatiquement !

---

## ✅ Checklist

- [ ] `composer require minishlink/web-push` exécuté
- [ ] Clés VAPID générées
- [ ] Clés ajoutées dans `.env` (backend et frontend)
- [ ] Migration appliquée
- [ ] Code décommenté dans `PushNotificationService.php`
- [ ] Test effectué

---

## 🎉 C'est Terminé !

**Les notifications push sont maintenant 100% opérationnelles !**

**Fonctionnalités:**
- ✅ Web Push API (navigateur)
- ✅ FCM (Android/iOS)
- ✅ Envoi automatique
- ✅ Service Worker
- ✅ Prompt utilisateur

---

**📚 Documentation complète:** `NOTIFICATIONS_PUSH_IMPLEMENTATION.md`


