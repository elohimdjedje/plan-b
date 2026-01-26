# 🗄️ Application Migration Webhooks - Instructions

## ✅ Script SQL Prêt

Le fichier `planb-backend/migrations/add_webhook_logs.sql` est prêt à être exécuté.

---

## 🚀 Méthode 1: Via pgAdmin (Recommandé)

### Étapes

1. **Ouvrir pgAdmin**
   - Lancer pgAdmin depuis le menu Démarrer

2. **Se connecter au serveur PostgreSQL**
   - Double-cliquer sur votre serveur PostgreSQL
   - Entrer le mot de passe si demandé

3. **Sélectionner la base de données**
   - Développer "Databases"
   - Double-cliquer sur `planb` (ou votre nom de base)

4. **Ouvrir Query Tool**
   - Clic droit sur `planb` > **Query Tool**
   - Ou utiliser le raccourci **F5**

5. **Copier le script SQL**
   - Ouvrir le fichier: `planb-backend/migrations/add_webhook_logs.sql`
   - Sélectionner tout (Ctrl+A)
   - Copier (Ctrl+C)

6. **Coller et exécuter**
   - Coller dans Query Tool (Ctrl+V)
   - Cliquer sur **Execute** (F5)

7. **Vérifier le résultat**
   - Vous devriez voir: `CREATE TABLE` et `CREATE INDEX` réussis

---

## 🚀 Méthode 2: Via psql (Ligne de commande)

### Si psql est dans votre PATH

```bash
cd planb-backend/migrations
psql -U postgres -d planb -f add_webhook_logs.sql
```

**Remplacez:**
- `postgres` par votre utilisateur PostgreSQL
- `planb` par votre nom de base de données

### Si psql n'est pas dans le PATH

Trouver le chemin de psql (généralement dans le dossier d'installation PostgreSQL) :

```bash
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d planb -f add_webhook_logs.sql
```

**Remplacez `15` par votre version de PostgreSQL**

---

## 🚀 Méthode 3: Via SQL Direct

### Se connecter à PostgreSQL

```bash
psql -U postgres -d planb
```

### Exécuter les commandes

```sql
\i planb-backend/migrations/add_webhook_logs.sql
```

Ou copier-coller directement le contenu du fichier SQL.

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

**Résultat attendu:** Liste des colonnes et index

### Vérifier les index

```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'webhook_logs';
```

**Résultat attendu:**
```
              indexname
-----------------------------------
 webhook_logs_pkey
 idx_webhook_provider_status
 idx_webhook_transaction
 idx_webhook_created
```

---

## 🐛 Dépannage

### Erreur: "relation already exists"

**Solution:** La table existe déjà. Vous pouvez :
- Soit ignorer (la migration est déjà appliquée)
- Soit supprimer et recréer :
  ```sql
  DROP TABLE IF EXISTS webhook_logs CASCADE;
  ```
  Puis réexécuter le script.

### Erreur: "permission denied"

**Solution:** Utiliser un utilisateur avec les droits d'administration :
```bash
psql -U postgres -d planb -f add_webhook_logs.sql
```

### Erreur: "database does not exist"

**Solution:** Créer la base de données d'abord :
```sql
CREATE DATABASE planb;
```

---

## 📋 Contenu du Script SQL

Le script crée :
- ✅ Table `webhook_logs` avec toutes les colonnes
- ✅ Index `idx_webhook_provider_status`
- ✅ Index `idx_webhook_transaction`
- ✅ Index `idx_webhook_created`
- ✅ Contraintes et types appropriés

---

## ✅ Checklist

- [ ] Script SQL ouvert
- [ ] Connexion à PostgreSQL établie
- [ ] Base de données `planb` sélectionnée
- [ ] Script exécuté
- [ ] Table `webhook_logs` créée
- [ ] Index créés
- [ ] Vérification effectuée

---

## 🎉 C'est Terminé !

Une fois la migration appliquée, les webhooks seront **100% opérationnels** !

**Prochaine étape:** Configurer les secrets webhooks dans `.env` avec les vrais secrets depuis les dashboards.


