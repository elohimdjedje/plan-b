# ✅ Migration Webhooks - Prêt à Appliquer

## 📋 Statut

- ✅ Script SQL créé: `planb-backend/migrations/add_webhook_logs.sql`
- ✅ Variables .env configurées
- ✅ Documentation complète créée

---

## 🚀 Application Rapide

### Option 1: pgAdmin (Le Plus Simple)

1. **Ouvrir pgAdmin**
2. **Se connecter** à votre serveur PostgreSQL
3. **Sélectionner** la base `planb`
4. **Clic droit** > **Query Tool** (ou F5)
5. **Ouvrir** le fichier: `planb-backend/migrations/add_webhook_logs.sql`
6. **Copier tout** (Ctrl+A, Ctrl+C)
7. **Coller** dans Query Tool (Ctrl+V)
8. **Exécuter** (F5 ou bouton Execute)

**✅ C'est tout !** La table `webhook_logs` sera créée.

---

### Option 2: Ligne de Commande

Si vous avez `psql` dans votre PATH :

```bash
cd planb-backend
psql -U postgres -d planb -f migrations/add_webhook_logs.sql
```

**Remplacez:**
- `postgres` par votre utilisateur PostgreSQL
- `planb` par votre nom de base

---

### Option 3: PowerShell Script

Un script PowerShell a été créé pour automatiser :

```powershell
cd planb-backend/migrations
.\apply_webhook_migration.ps1
```

---

## ✅ Vérification

Après l'exécution, vérifier dans pgAdmin :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'webhook_logs';
```

**Résultat attendu:** `webhook_logs`

---

## 📄 Fichiers Créés

- ✅ `planb-backend/migrations/add_webhook_logs.sql` - Script SQL
- ✅ `planb-backend/migrations/apply_webhook_migration.ps1` - Script PowerShell
- ✅ `APPLIQUER_MIGRATION_WEBHOOKS.md` - Guide détaillé
- ✅ `WEBHOOKS_CONFIGURATION_FINALE.md` - Configuration complète

---

## 🎯 Prochaines Étapes

Une fois la migration appliquée :

1. ✅ Remplacer les secrets dans `.env` par les vrais secrets
2. ✅ Configurer les URLs webhooks dans les dashboards Wave/Orange Money
3. ✅ Tester avec un paiement réel

---

**🎉 Tout est prêt ! Il suffit d'exécuter le script SQL dans pgAdmin !**


