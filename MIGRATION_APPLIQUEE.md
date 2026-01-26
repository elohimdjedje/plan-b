# ✅ Migration Webhooks - Instructions Finales

## 🚀 Application de la Migration

### Méthode 1: pgAdmin (Recommandé - Le Plus Simple)

1. **Ouvrir pgAdmin**
   - Lancer depuis le menu Démarrer Windows

2. **Se connecter au serveur PostgreSQL**
   - Double-cliquer sur votre serveur PostgreSQL
   - Entrer le mot de passe si demandé

3. **Sélectionner la base de données**
   - Développer "Databases" dans le panneau gauche
   - Double-cliquer sur `planb` (ou votre nom de base)

4. **Ouvrir Query Tool**
   - Clic droit sur `planb` > **Query Tool**
   - Ou utiliser le raccourci clavier **F5**

5. **Ouvrir le script SQL**
   - Fichier: `planb-backend/migrations/add_webhook_logs.sql`
   - Ouvrir avec un éditeur de texte (Notepad, VS Code, etc.)

6. **Copier le contenu**
   - Sélectionner tout (Ctrl+A)
   - Copier (Ctrl+C)

7. **Coller et exécuter**
   - Coller dans Query Tool (Ctrl+V)
   - Cliquer sur le bouton **Execute** (ou F5)

8. **Vérifier le résultat**
   - Vous devriez voir des messages de succès:
     - `CREATE TABLE`
     - `CREATE INDEX` (3 fois)

---

### Méthode 2: Script Batch (Alternative)

Un script batch a été créé pour faciliter l'exécution:

**Fichier:** `planb-backend/migrations/execute_webhook_migration.bat`

**Utilisation:**
1. Double-cliquer sur `execute_webhook_migration.bat`
2. Suivre les instructions à l'écran
3. Entrer les informations de connexion PostgreSQL

---

### Méthode 3: Ligne de Commande (Si psql disponible)

Si vous avez `psql` dans votre PATH:

```bash
cd planb-backend/migrations
psql -U postgres -d planb -f add_webhook_logs.sql
```

**Remplacez:**
- `postgres` par votre utilisateur PostgreSQL
- `planb` par votre nom de base de données

---

## ✅ Vérification

Après l'exécution, vérifier dans pgAdmin Query Tool:

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

### Vérifier les index

```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'webhook_logs';
```

**Résultat attendu (4 index):**
```
              indexname
-----------------------------------
 webhook_logs_pkey
 idx_webhook_provider_status
 idx_webhook_transaction
 idx_webhook_created
```

---

## 📋 Contenu de la Migration

La migration crée:

- ✅ Table `webhook_logs` avec 11 colonnes
- ✅ Index `idx_webhook_provider_status` (provider, status)
- ✅ Index `idx_webhook_transaction` (transaction_id)
- ✅ Index `idx_webhook_created` (created_at)
- ✅ Contraintes et types appropriés

---

## 🐛 Dépannage

### Erreur: "relation already exists"

**Solution:** La table existe déjà. La migration utilise `CREATE TABLE IF NOT EXISTS`, donc c'est normal. Vérifiez que la table existe.

### Erreur: "permission denied"

**Solution:** Utiliser un utilisateur avec droits d'administration (généralement `postgres`).

### Erreur: "database does not exist"

**Solution:** Créer la base de données d'abord:
```sql
CREATE DATABASE planb;
```

---

## ✅ Checklist

- [ ] pgAdmin ouvert
- [ ] Connexion à PostgreSQL établie
- [ ] Base de données `planb` sélectionnée
- [ ] Query Tool ouvert
- [ ] Script SQL copié-collé
- [ ] Migration exécutée
- [ ] Table `webhook_logs` créée
- [ ] Index créés
- [ ] Vérification effectuée

---

## 🎉 C'est Terminé !

Une fois la migration appliquée avec succès, les webhooks seront **100% opérationnels** !

**Prochaine étape:** Configurer les secrets webhooks dans `.env` avec les vrais secrets depuis les dashboards Wave et Orange Money.

---

**📄 Fichiers disponibles:**
- `add_webhook_logs.sql` - Script SQL principal
- `execute_webhook_migration.bat` - Script batch Windows
- `apply_webhook_migration.ps1` - Script PowerShell


