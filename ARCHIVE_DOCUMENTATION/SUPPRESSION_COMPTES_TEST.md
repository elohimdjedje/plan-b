# 🗑️ SUPPRIMER LES COMPTES DE TEST

## 📌 VOUS AVEZ 2 COMPTES À SUPPRIMER

D'après Adminer, vous avez :
1. `test@exemple.com` (ID: 1)
2. `admin@planb.com` (ID: 2)

---

## ✅ MÉTHODE 1 : VIA ADMINER (INTERFACE WEB)

### **ÉTAPE 1 : Aller dans la table users**

**1. Ouvrez Adminer :**
```
http://localhost:8080
```

**2. Connectez-vous avec :**
```
Serveur : planb_postgres
Utilisateur : postgres
Mot de passe : root
Base de données : planb
```

**3. Cliquez sur `users` dans le menu à gauche**

---

### **ÉTAPE 2 : Sélectionner les lignes à supprimer**

**1. Cochez les cases à gauche des 2 comptes :**
- ☑️ Ligne 1 : test@exemple.com
- ☑️ Ligne 2 : admin@planb.com

**2. En bas de la page, dans le menu déroulant, sélectionnez :**
```
Supprimer (ou "Delete")
```

**3. Cliquez sur "Exécuter" (ou "Execute")**

**4. Confirmez la suppression**

---

## ✅ MÉTHODE 2 : VIA SQL (PLUS RAPIDE)

### **Dans Adminer :**

**1. Cliquez sur "SQL" (onglet en haut)**

**2. Tapez cette commande :**
```sql
DELETE FROM users WHERE email IN ('test@exemple.com', 'admin@planb.com');
```

**3. Cliquez sur "Exécuter"**

**4. Vous devriez voir :**
```
Requête a réussi, 2 lignes affectées.
```

---

## ✅ MÉTHODE 3 : SUPPRIMER TOUT

### **Si vous voulez TOUT supprimer :**

**Dans Adminer → SQL :**
```sql
TRUNCATE TABLE users CASCADE;
```

**⚠️ ATTENTION : Cela supprime TOUS les utilisateurs !**

---

## 🔍 VÉRIFIER LA SUPPRESSION

### **Après suppression, vérifiez :**

**1. Allez dans Adminer → `users` → Sélectionner les données**

**2. Vous devriez voir :**
```
0 lignes
```

**OU si vous avez tout supprimé :**
```
Aucune ligne trouvée
```

---

## 🎯 APRÈS SUPPRESSION

### **Créer un VRAI compte de test :**

**1. Allez sur :**
```
http://localhost:5173/auth/register
```

**2. Créez un compte avec de vraies informations :**
```
Nom complet : Votre nom
Email : votre@email.com
Téléphone : 0700000000
Mot de passe : VotreMotDePasse123!
```

**3. Vérifiez dans Adminer que le compte apparaît**

---

## 📊 COMMANDES SQL UTILES

### **Voir tous les utilisateurs :**
```sql
SELECT * FROM users;
```

### **Compter les utilisateurs :**
```sql
SELECT COUNT(*) FROM users;
```

### **Supprimer un utilisateur par email :**
```sql
DELETE FROM users WHERE email = 'test@exemple.com';
```

### **Supprimer un utilisateur par ID :**
```sql
DELETE FROM users WHERE id = 1;
```

### **Supprimer plusieurs utilisateurs :**
```sql
DELETE FROM users WHERE id IN (1, 2);
```

---

## 🆘 EN CAS DE PROBLÈME

### **Erreur "constraint violation" :**

Si vous avez des erreurs de contraintes, supprimez d'abord les dépendances :

```sql
-- Supprimer les annonces de ces utilisateurs
DELETE FROM listings WHERE user_id IN (1, 2);

-- Supprimer les paiements
DELETE FROM payments WHERE user_id IN (1, 2);

-- Supprimer les abonnements
DELETE FROM subscriptions WHERE user_id IN (1, 2);

-- Puis supprimer les utilisateurs
DELETE FROM users WHERE id IN (1, 2);
```

---

## ✅ RÉSUMÉ RAPIDE

**Pour supprimer les 2 comptes de test :**

1. Aller sur http://localhost:8080
2. Cliquer sur "SQL"
3. Taper : `DELETE FROM users WHERE id IN (1, 2);`
4. Cliquer sur "Exécuter"
5. Vérifier : `SELECT * FROM users;`

**C'est fait ! 🎉**

---

*Guide créé le 9 novembre 2025 - 16:25*
