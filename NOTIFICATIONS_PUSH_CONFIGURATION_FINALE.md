# ✅ Notifications Push - Configuration Finale

## 🎉 Statut : **CONFIGURÉ**

---

## ✅ Ce qui a été fait

### 1. Clés VAPID générées ✅
- ✅ Clé publique générée
- ✅ Clé privée générée
- ✅ Ajoutées dans `planb-backend/.env`
- ✅ Clé publique ajoutée dans `planb-frontend/.env`

### 2. Configuration .env ✅

**Backend (`planb-backend/.env`):**
```env
VAPID_PUBLIC_KEY=BEK9_4fkO3kUEFOpwSfD_hYJFeDEhKhthBpfLcrwD4kuYURtb0Y6wymS62WVPQjwlojBEX81rmOih7vr94z5H38
VAPID_PRIVATE_KEY=h89IFi85-avRLjv_pylcCU-n5d1kU-JwGJVdvAeJvVY
VAPID_SUBJECT=mailto:admin@planb.com
```

**Frontend (`planb-frontend/.env`):**
```env
VITE_VAPID_PUBLIC_KEY=BEK9_4fkO3kUEFOpwSfD_hYJFeDEhKhthBpfLcrwD4kuYURtb0Y6wymS62WVPQjwlojBEX81rmOih7vr94z5H38
```

---

## ⏳ Reste à faire

### 1. Installer la Dépendance Backend

**Si Composer est dans votre PATH:**
```bash
cd planb-backend
composer require minishlink/web-push
```

**Si Composer n'est pas dans PATH:**
- Trouver le chemin de Composer (généralement dans le dossier PHP)
- Exécuter: `C:\chemin\vers\composer.phar require minishlink/web-push`

**Ou manuellement:**
- Éditer `composer.json` (déjà fait ✅)
- Exécuter `composer install` ou `composer update`

### 2. Appliquer la Migration

**Via pgAdmin (Recommandé):**
1. Ouvrir pgAdmin
2. Se connecter à PostgreSQL
3. Sélectionner la base `planb`
4. Query Tool (F5)
5. Ouvrir: `planb-backend/migrations/add_push_subscriptions.sql`
6. Copier-coller et exécuter (F5)

**Résultat attendu:**
```
CREATE TABLE
CREATE INDEX (3 fois)
COMMENT (3 fois)
```

---

## ✅ Vérification

### Vérifier que la table existe

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'push_subscriptions';
```

**Résultat attendu:** `push_subscriptions`

---

## 🧪 Test

### Test 1: Vérifier la Configuration

1. Redémarrer le backend Symfony
2. Redémarrer le frontend
3. Ouvrir l'app dans le navigateur
4. Se connecter
5. Attendre 3 secondes
6. ✅ Voir le prompt "Activer les notifications"

### Test 2: S'abonner

1. Cliquer "Activer" dans le prompt
2. Autoriser les notifications dans le navigateur
3. ✅ Voir "Notifications activées"

### Test 3: Envoyer une Notification

Créer une notification via l'API ou l'interface admin.

✅ La notification push sera envoyée automatiquement !

---

## ✅ Checklist

- [x] Clés VAPID générées
- [x] Clés ajoutées dans `.env` (backend)
- [x] Clé publique ajoutée dans `.env` (frontend)
- [ ] Installer `minishlink/web-push` (composer)
- [ ] Appliquer migration SQL
- [ ] Redémarrer backend
- [ ] Redémarrer frontend
- [ ] Tester

---

## 🎉 C'est Presque Terminé !

**Il reste juste à:**
1. Installer la dépendance Composer (si pas déjà fait)
2. Appliquer la migration SQL dans pgAdmin

**Tout le reste est configuré !** 🚀

---

**📄 Script SQL:** `planb-backend/migrations/add_push_subscriptions.sql`


