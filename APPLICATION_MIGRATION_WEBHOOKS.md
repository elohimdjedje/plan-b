# 📋 Application Migration Webhooks - Guide

## ✅ Configuration .env

Les variables suivantes ont été ajoutées dans `planb-backend/.env` :

```env
WAVE_WEBHOOK_SECRET=whsec_votre_secret_wave
OM_WEBHOOK_SECRET=change-this-secret-key-in-production
SOCKETIO_URL=http://localhost:3001
```

**⚠️ Important :** Remplacez les valeurs par défaut par vos vrais secrets webhooks !

---

## 🗄️ Application de la Migration

### Option 1: Via Doctrine (Recommandé)

Si PHP est dans votre PATH :

```bash
cd planb-backend
php bin/console doctrine:migrations:migrate
```

Tapez `yes` quand demandé.

### Option 2: Via SQL Direct (Si PHP non disponible)

Exécuter le script SQL dans PostgreSQL :

**Via pgAdmin:**
1. Ouvrir pgAdmin
2. Se connecter à la base de données `planb`
3. Ouvrir Query Tool
4. Copier-coller le contenu de `migrations/add_webhook_logs.sql`
5. Exécuter (F5)

**Via psql:**
```bash
psql -U postgres -d planb -f planb-backend/migrations/add_webhook_logs.sql
```

**Via ligne de commande PostgreSQL:**
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

**Résultat attendu:**
```
 table_name
-------------
 webhook_logs
```

### Vérifier la structure

```sql
\d webhook_logs
```

**Résultat attendu:**
```
                                      Table "public.webhook_logs"
     Column      |            Type             | Collation | Nullable |      Default
-----------------+-----------------------------+-----------+----------+------------------
 id              | integer                     |           | not null | nextval('webhook_logs_id_seq'::regclass)
 provider        | character varying(50)        |           | not null |
 payload         | text                        |           | not null |
 signature       | text                        |           |          |
 transaction_id  | character varying(255)      |           |          |
 event_type      | character varying(100)      |           |          |
 status          | character varying(20)       |           | not null | 'received'::character varying
 error_message   | text                        |           |          |
 ip_address      | character varying(45)       |           |          |
 created_at      | timestamp without time zone |           | not null |
 processed_at    | timestamp without time zone |           |          |
Indexes:
    "webhook_logs_pkey" PRIMARY KEY, btree (id)
    "idx_webhook_created" btree (created_at)
    "idx_webhook_provider_status" btree (provider, status)
    "idx_webhook_transaction" btree (transaction_id)
```

---

## 🔧 Configuration des Secrets

### Wave

1. Aller sur [developer.wave.com](https://developer.wave.com)
2. Se connecter à votre compte Business
3. Aller dans **Settings > Webhooks**
4. Copier le **Webhook Secret**
5. Remplacer dans `.env` :
   ```env
   WAVE_WEBHOOK_SECRET=votre_vrai_secret_wave
   ```

### Orange Money

1. Aller sur [developer.orange.com](https://developer.orange.com)
2. Se connecter à votre compte développeur
3. Aller dans **Settings > Webhooks**
4. Copier le **Webhook Secret**
5. Remplacer dans `.env` :
   ```env
   OM_WEBHOOK_SECRET=votre_vrai_secret_orange_money
   ```

---

## 🧪 Test

### Test 1: Vérifier la route webhook

```bash
curl -X POST http://localhost:8000/api/v1/webhooks/wave \
  -H "Content-Type: application/json" \
  -H "X-Wave-Signature: test" \
  -d '{"transaction":{"id":"test123"}}'
```

**Résultat attendu:** `{"error":"Signature invalide"}` (normal, signature de test)

### Test 2: Vérifier les logs

```bash
curl http://localhost:8000/api/v1/webhooks/logs
```

**Résultat attendu:** Liste des webhooks reçus (vide au début)

---

## ✅ Checklist

- [x] Variables ajoutées dans `.env`
- [ ] Migration appliquée (SQL ou Doctrine)
- [ ] Table `webhook_logs` créée
- [ ] Index créés
- [ ] Secrets configurés (Wave et Orange Money)
- [ ] Tests effectués

---

## 🎉 C'est Terminé !

Une fois la migration appliquée et les secrets configurés, les webhooks seront **100% opérationnels** !

**Prochaine étape:** Configurer les URLs webhooks dans les dashboards Wave et Orange Money.


