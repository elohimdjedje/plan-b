# ✅ Webhooks - Configuration Finale

## 🎉 Statut : **CONFIGURÉ**

---

## ✅ Ce qui a été fait

### 1. Variables .env ✅
- ✅ `WAVE_WEBHOOK_SECRET` ajouté
- ✅ `OM_WEBHOOK_SECRET` ajouté
- ✅ `SOCKETIO_URL` déjà présent

**Fichier:** `planb-backend/.env`

```env
WAVE_WEBHOOK_SECRET=whsec_votre_secret_wave
OM_WEBHOOK_SECRET=change-this-secret-key-in-production
SOCKETIO_URL=http://localhost:3001
```

**⚠️ Important:** Remplacez les valeurs par défaut par vos vrais secrets depuis les dashboards Wave et Orange Money !

---

## 🗄️ Migration à Appliquer

### Option 1: Via Doctrine (Si PHP disponible)

```bash
cd planb-backend
php bin/console doctrine:migrations:migrate
```

### Option 2: Via SQL Direct (Recommandé si PHP non disponible)

**Fichier SQL créé:** `planb-backend/migrations/add_webhook_logs.sql`

**Exécuter dans PostgreSQL:**

**Via pgAdmin:**
1. Ouvrir pgAdmin
2. Se connecter à la base `planb`
3. Query Tool (F5)
4. Copier-coller le contenu de `add_webhook_logs.sql`
5. Exécuter

**Via psql:**
```bash
psql -U postgres -d planb -f planb-backend/migrations/add_webhook_logs.sql
```

**Via ligne de commande:**
```sql
\c planb
\i planb-backend/migrations/add_webhook_logs.sql
```

---

## ✅ Vérification

### Vérifier que la table existe

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'webhook_logs';
```

**Résultat attendu:** `webhook_logs`

---

## 🔧 Configuration des Secrets

### Wave Dashboard

1. Aller sur [developer.wave.com](https://developer.wave.com)
2. **Settings > Webhooks**
3. Copier le **Webhook Secret**
4. Remplacer dans `.env` :
   ```env
   WAVE_WEBHOOK_SECRET=votre_vrai_secret
   ```

### Orange Money Dashboard

1. Aller sur [developer.orange.com](https://developer.orange.com)
2. **Settings > Webhooks**
3. Copier le **Webhook Secret**
4. Remplacer dans `.env` :
   ```env
   OM_WEBHOOK_SECRET=votre_vrai_secret
   ```

### Configuration des URLs Webhooks

Dans les dashboards, configurer les URLs :

**Wave:**
```
https://votre-domaine.com/api/v1/webhooks/wave
```

**Orange Money:**
```
https://votre-domaine.com/api/v1/webhooks/orange-money
```

---

## 🧪 Test

### Test 1: Vérifier la route

```bash
curl -X POST http://localhost:8000/api/v1/webhooks/wave \
  -H "Content-Type: application/json" \
  -H "X-Wave-Signature: test" \
  -d '{"transaction":{"id":"test123"}}'
```

**Résultat attendu:** `{"error":"Signature invalide"}` (normal)

### Test 2: Vérifier les logs

```bash
curl http://localhost:8000/api/v1/webhooks/logs
```

---

## ✅ Checklist

- [x] Variables ajoutées dans `.env`
- [ ] Migration SQL appliquée
- [ ] Table `webhook_logs` créée
- [ ] Secrets configurés (Wave)
- [ ] Secrets configurés (Orange Money)
- [ ] URLs webhooks configurées dans dashboards
- [ ] Tests effectués

---

## 📚 Documentation

- `WEBHOOKS_PAIEMENTS_IMPLEMENTATION.md` - Guide complet
- `WEBHOOKS_PAIEMENTS_RESUME.md` - Résumé
- `APPLICATION_MIGRATION_WEBHOOKS.md` - Instructions migration

---

## 🎉 C'est Prêt !

**Il reste juste à :**
1. ✅ Appliquer la migration SQL (fichier créé)
2. ✅ Remplacer les secrets par défaut par les vrais secrets
3. ✅ Configurer les URLs dans les dashboards

**Tous les fichiers sont créés et configurés !** 🚀


