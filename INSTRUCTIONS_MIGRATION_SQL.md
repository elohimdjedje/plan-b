# 📋 Instructions pour Appliquer la Migration SQL

## 🎯 Objectif

Appliquer la migration SQL pour créer les 8 nouvelles tables du système de réservation et paiement.

---

## ✅ Méthode 1 : Script PowerShell (Recommandé)

### Étapes :

1. **Ouvrir PowerShell** dans le dossier du projet
2. **Exécuter le script :**
   ```powershell
   .\appliquer-migration-booking.ps1
   ```
3. **Entrer les informations de connexion :**
   - Host (par défaut: localhost)
   - Port (par défaut: 5432)
   - Nom de la base de données (OBLIGATOIRE)
   - Nom d'utilisateur (par défaut: postgres)
   - Mot de passe

4. **Le script appliquera automatiquement la migration**

---

## ✅ Méthode 2 : pgAdmin (Interface Graphique)

### Étapes :

1. **Ouvrir pgAdmin**
2. **Se connecter à votre serveur PostgreSQL**
3. **Sélectionner votre base de données**
4. **Clic droit sur la base → Query Tool**
5. **Ouvrir le fichier :**
   - `planb-backend/migrations/create_booking_system.sql`
6. **Exécuter le script :**
   - Cliquer sur le bouton "Execute" (▶) ou appuyer sur F5
7. **Vérifier le résultat :**
   - Vous devriez voir "Success" dans l'onglet Messages

---

## ✅ Méthode 3 : psql (Ligne de commande)

### Prérequis :
- PostgreSQL installé
- `psql` dans le PATH

### Étapes :

1. **Ouvrir PowerShell ou CMD**
2. **Se connecter à PostgreSQL :**
   ```bash
   psql -U votre_utilisateur -d votre_base_de_donnees
   ```
3. **Exécuter le fichier SQL :**
   ```bash
   \i planb-backend/migrations/create_booking_system.sql
   ```
   Ou depuis PowerShell :
   ```powershell
   psql -U votre_utilisateur -d votre_base_de_donnees -f planb-backend/migrations/create_booking_system.sql
   ```

---

## ✅ Méthode 4 : Copier-Coller Manuel

### Étapes :

1. **Ouvrir le fichier :**
   - `planb-backend/migrations/create_booking_system.sql`
2. **Copier tout le contenu** (Ctrl+A, Ctrl+C)
3. **Ouvrir votre outil de gestion de base de données** (pgAdmin, DBeaver, etc.)
4. **Coller le contenu** dans l'éditeur SQL
5. **Exécuter** (F5 ou bouton Execute)

---

## 🔍 Vérification

Après l'application de la migration, vérifiez que les tables suivantes existent :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'bookings',
    'payments',
    'escrow_accounts',
    'contracts',
    'receipts',
    'availability_calendar',
    'payment_reminders',
    'late_payment_penalties'
)
ORDER BY table_name;
```

Vous devriez voir **8 tables** dans les résultats.

---

## ⚠️ Notes Importantes

1. **Sauvegarde :** Faites une sauvegarde de votre base de données avant d'appliquer la migration
2. **Permissions :** Assurez-vous que l'utilisateur PostgreSQL a les permissions nécessaires (CREATE TABLE, etc.)
3. **Conflits :** Si certaines tables existent déjà, le script utilisera `CREATE TABLE IF NOT EXISTS` pour éviter les erreurs
4. **Index :** Les index seront créés automatiquement

---

## 🐛 Résolution de Problèmes

### Erreur : "relation already exists"
- **Cause :** Les tables existent déjà
- **Solution :** C'est normal, le script utilise `IF NOT EXISTS`

### Erreur : "permission denied"
- **Cause :** L'utilisateur n'a pas les permissions
- **Solution :** Connectez-vous en tant qu'utilisateur avec les droits d'administration

### Erreur : "could not connect to server"
- **Cause :** PostgreSQL n'est pas démarré ou les informations de connexion sont incorrectes
- **Solution :** Vérifiez que PostgreSQL est démarré et que les informations sont correctes

---

## ✅ Après l'Application

Une fois la migration appliquée avec succès :

1. ✅ Les 8 nouvelles tables sont créées
2. ✅ Les index sont créés
3. ✅ Les contraintes sont en place
4. ✅ Le système de réservation est opérationnel

**Vous pouvez maintenant tester le système !** 🎉

---

## 📞 Besoin d'Aide ?

Si vous rencontrez des problèmes :
1. Vérifiez les logs d'erreur PostgreSQL
2. Vérifiez que PostgreSQL est démarré
3. Vérifiez les permissions de l'utilisateur
4. Consultez la documentation PostgreSQL
