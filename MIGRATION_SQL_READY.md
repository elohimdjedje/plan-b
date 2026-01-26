# ✅ Migration SQL Prête à Appliquer

## 📋 Fichier de Migration

**Emplacement :** `planb-backend/migrations/create_booking_system.sql`

**Taille :** ~200 lignes de SQL

**Contenu :**
- ✅ 8 nouvelles tables
- ✅ Index pour performance
- ✅ Contraintes de validation
- ✅ Modifications tables existantes

---

## 🎯 Action Requise

**Vous devez appliquer cette migration manuellement** car elle nécessite :
- Connexion à PostgreSQL
- Informations de connexion (base de données, utilisateur, mot de passe)

---

## 🚀 Méthode la Plus Simple

### Via pgAdmin (2 minutes) :

1. Ouvrir pgAdmin
2. Se connecter à PostgreSQL
3. Clic droit sur votre base → **Query Tool**
4. Ouvrir le fichier : `planb-backend/migrations/create_booking_system.sql`
5. Cliquer **Execute** (F5)
6. ✅ C'est fait !

---

## 📝 Fichiers Créés

J'ai créé ces fichiers pour vous aider :

1. **`appliquer-migration-booking.ps1`** - Script PowerShell interactif
2. **`INSTRUCTIONS_MIGRATION_SQL.md`** - Guide détaillé avec 4 méthodes
3. **`APPLIQUER_MIGRATION_MAINTENANT.md`** - Guide rapide (3 méthodes simples)

---

## ⚠️ Important

**Sans cette migration, le système ne fonctionnera pas !**

Les endpoints API retourneront des erreurs car les tables n'existent pas encore.

---

## ✅ Après l'Application

Une fois la migration appliquée, vous pourrez :
- ✅ Créer des réservations
- ✅ Accepter/refuser des réservations
- ✅ Effectuer des paiements
- ✅ Générer des quittances
- ✅ Gérer le compte séquestre

---

**Suivez le guide `APPLIQUER_MIGRATION_MAINTENANT.md` pour appliquer la migration maintenant !** 🚀
