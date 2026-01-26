# 🚀 Appliquer la Migration SQL - Guide Rapide

## ⚠️ IMPORTANT

Le script PowerShell nécessite une interaction manuelle. Voici **3 méthodes simples** pour appliquer la migration :

---

## ✅ MÉTHODE 1 : pgAdmin (LE PLUS SIMPLE - 2 minutes)

### Étapes :

1. **Ouvrir pgAdmin**
   - Si vous ne l'avez pas, téléchargez-le : https://www.pgadmin.org/download/

2. **Se connecter à votre base de données**
   - Clic gauche sur votre serveur PostgreSQL
   - Entrer le mot de passe si demandé

3. **Sélectionner votre base de données**
   - Clic gauche sur la base de données (ex: `planb` ou `plan_b`)

4. **Ouvrir Query Tool**
   - Clic droit sur la base de données
   - Cliquer sur "Query Tool"

5. **Ouvrir le fichier SQL**
   - Dans Query Tool, cliquer sur l'icône "Open File" (📁)
   - Naviguer vers : `planb-backend/migrations/create_booking_system.sql`
   - Sélectionner le fichier et cliquer "Open"

6. **Exécuter le script**
   - Cliquer sur le bouton "Execute" (▶) en haut
   - OU appuyer sur **F5**

7. **Vérifier le résultat**
   - Vous devriez voir "Success" dans l'onglet Messages
   - Les 8 tables sont maintenant créées !

---

## ✅ MÉTHODE 2 : PowerShell Interactif (3 minutes)

### Étapes :

1. **Ouvrir PowerShell** (pas en mode script)
   - Appuyer sur `Win + X`
   - Cliquer sur "Windows PowerShell" ou "Terminal"
   - Naviguer vers le dossier du projet :
     ```powershell
     cd "C:\Users\ST Pierre\Downloads\plan-b-main\plan-b-main"
     ```

2. **Exécuter le script :**
   ```powershell
   .\appliquer-migration-booking.ps1
   ```

3. **Répondre aux questions :**
   - Host : `localhost` (appuyer Entrée)
   - Port : `5432` (appuyer Entrée)
   - Nom de la base de données : **ENTRER LE NOM DE VOTRE BASE** (ex: `planb`)
   - Nom d'utilisateur : `postgres` (appuyer Entrée)
   - Mot de passe : **ENTRER VOTRE MOT DE PASSE**

4. **Attendre la confirmation**
   - Vous verrez "✅ Migration appliquée avec succès!"

---

## ✅ MÉTHODE 3 : Copier-Coller Direct (2 minutes)

### Étapes :

1. **Ouvrir le fichier SQL :**
   - `planb-backend/migrations/create_booking_system.sql`
   - Sélectionner tout (Ctrl+A)
   - Copier (Ctrl+C)

2. **Ouvrir votre outil de gestion SQL :**
   - pgAdmin (Query Tool)
   - DBeaver
   - TablePlus
   - Ou tout autre outil SQL

3. **Coller le contenu** (Ctrl+V)

4. **Exécuter** (F5 ou bouton Execute)

---

## 🔍 VÉRIFICATION

Après l'application, vérifiez que les tables existent :

### Dans pgAdmin :
1. Clic droit sur votre base de données → "Refresh"
2. Développer "Schemas" → "public" → "Tables"
3. Vous devriez voir ces 8 nouvelles tables :
   - ✅ `bookings`
   - ✅ `payments`
   - ✅ `escrow_accounts`
   - ✅ `contracts`
   - ✅ `receipts`
   - ✅ `availability_calendar`
   - ✅ `payment_reminders`
   - ✅ `late_payment_penalties`

### Ou exécuter cette requête SQL :
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'bookings', 'payments', 'escrow_accounts', 'contracts',
    'receipts', 'availability_calendar', 'payment_reminders', 
    'late_payment_penalties'
)
ORDER BY table_name;
```

---

## ⚠️ EN CAS D'ERREUR

### Erreur : "relation already exists"
- ✅ **C'est normal !** Le script utilise `IF NOT EXISTS`
- Les tables existantes ne seront pas modifiées

### Erreur : "permission denied"
- Vérifiez que vous êtes connecté avec un utilisateur administrateur
- Essayez avec l'utilisateur `postgres`

### Erreur : "could not connect"
- Vérifiez que PostgreSQL est démarré
- Vérifiez les informations de connexion (host, port, nom de base)

---

## ✅ APRÈS L'APPLICATION

Une fois la migration appliquée :

1. ✅ **Les 8 tables sont créées**
2. ✅ **Les index sont en place**
3. ✅ **Le système est opérationnel**

**Vous pouvez maintenant :**
- Tester la création d'une réservation
- Tester les paiements
- Utiliser toutes les fonctionnalités du système

---

## 🎯 RECOMMANDATION

**Utilisez la MÉTHODE 1 (pgAdmin)** - C'est la plus simple et la plus visuelle !

---

**Besoin d'aide ?** Consultez `INSTRUCTIONS_MIGRATION_SQL.md` pour plus de détails.
