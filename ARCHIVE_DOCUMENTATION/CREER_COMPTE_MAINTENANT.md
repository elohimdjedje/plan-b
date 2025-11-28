# 🚀 CRÉER UN COMPTE MAINTENANT - GUIDE COMPLET

**Status actuel** : ❌ 0 utilisateurs dans la base  
**Objectif** : ✅ Créer votre premier compte en 2 minutes

---

## ⚡ MÉTHODE RAPIDE (2 MINUTES)

### Étape 1 : Ouvrir la page d'inscription (10 secondes)

**Aller sur** : http://localhost:5173/auth/register-otp

> Vous devriez voir une page avec "Vérification du numéro de téléphone"

---

### Étape 2 : Entrer votre numéro de téléphone (10 secondes)

**Exemples de numéros valides** :
```
+225 07 12 34 56 78
+225 05 98 76 54 32
+225 01 23 45 67 89
```

**Format** : `+225 XX XX XX XX XX` (Côte d'Ivoire)

Puis cliquez sur **"Recevoir le code"**

---

### Étape 3 : Récupérer le code OTP (30 secondes)

**Option A - Script automatique** (RECOMMANDÉ) :
```powershell
cd "C:\Users\Elohim Mickael\Documents\plan-b"
.\get-otp.ps1
```

**Option B - Commande manuelle** :
```powershell
docker logs planb_api 2>&1 | Select-String "OTP Code" | Select-Object -Last 1
```

**Exemple de résultat** :
```
OTP Code for +22507123456 78: 123456
                              ^^^^^^
                        CODE A SAISIR
```

---

### Étape 4 : Entrer le code OTP (10 secondes)

**Saisir le code à 6 chiffres** dans les cases

Le timer commence à 5 minutes (300 secondes)

---

### Étape 5 : Compléter le formulaire (1 minute)

**Informations requises** :

| Champ | Exemple | Requis |
|-------|---------|--------|
| **Email** | mickael@test.com | ✅ |
| **Mot de passe** | Test1234 | ✅ (min 6 caractères) |
| **Prénom** | Mickael | ✅ |
| **Nom** | TEST | ✅ |
| **Pays** | Côte d'Ivoire | ✅ |
| **Ville** | Abidjan | ✅ |

**Cliquer sur "Créer mon compte"**

---

### Étape 6 : Vérification ✅

**Si réussi** :
- ✅ Message "Compte créé avec succès"
- ✅ Redirection vers `/auth/login`

**Vérifier dans la base de données** :
```powershell
docker exec planb_postgres psql -U postgres -d planb -c "SELECT id, email, first_name, last_name FROM users;"
```

**Résultat attendu** :
```
 id |       email        | first_name | last_name 
----+--------------------+------------+-----------
  1 | mickael@test.com   | Mickael    | TEST
(1 row)
```

---

## 🔧 APRÈS LA CRÉATION DU COMPTE

### Se connecter immédiatement

1. **Vous êtes déjà sur** `/auth/login`

2. **Entrer les identifiants** :
   - Email : mickael@test.com
   - Mot de passe : Test1234

3. **Cliquer "Se connecter"**

4. **✅ SUCCÈS** : Vous êtes redirigé vers l'accueil

---

## 🐛 DÉPANNAGE

### Problème : "Numéro de téléphone invalide"
**Solution** : Utiliser le format `+225 XX XX XX XX XX`

### Problème : "Code expiré ou introuvable"
**Causes possibles** :
1. Plus de 5 minutes écoulées → **Renvoyer le code**
2. Code mal saisi → **Vérifier les logs** avec `get-otp.ps1`
3. Backend redémarré → **Renvoyer le code**

### Problème : "Veuillez d'abord vérifier votre numéro"
**Solution** : Retour étape 2 → Renvoyer le code OTP

### Problème : Pas de code OTP dans les logs
**Vérifications** :
```powershell
# Backend fonctionne ?
docker ps | Select-String "planb_api"

# Logs backend
docker logs --tail 50 planb_api

# Redémarrer si besoin
docker restart planb_api
```

### Problème : "Email déjà utilisé"
**Solution** : 
- Utiliser un autre email : mickael2@test.com
- OU supprimer le compte existant :
  ```powershell
  cd planb-backend
  .\clean-db.ps1
  ```

---

## 📊 VÉRIFIER L'ÉTAT DE LA BASE

### Compter les utilisateurs
```powershell
docker exec planb_postgres psql -U postgres -d planb -c "SELECT COUNT(*) FROM users;"
```

### Voir tous les utilisateurs
```powershell
docker exec planb_postgres psql -U postgres -d planb -c "SELECT id, email, first_name, last_name, account_type, created_at FROM users ORDER BY created_at DESC;"
```

### Supprimer tous les comptes de test
```powershell
cd "C:\Users\Elohim Mickael\Documents\plan-b\planb-backend"
.\clean-db.ps1
```

---

## 🎯 EXEMPLE COMPLET

### Compte de test recommandé

**Créez ce compte pour vos tests** :

| Champ | Valeur |
|-------|--------|
| Téléphone | +225 07 00 00 00 01 |
| Email | demo@planb.ci |
| Mot de passe | Demo1234 |
| Prénom | Demo |
| Nom | PLANB |
| Pays | Côte d'Ivoire |
| Ville | Abidjan |

---

## ✅ CHECKLIST DE CRÉATION

- [ ] Backend lancé (`docker ps`)
- [ ] Page d'inscription ouverte
- [ ] Numéro de téléphone saisi (format +225...)
- [ ] Code OTP reçu dans les logs
- [ ] Code OTP saisi (6 chiffres)
- [ ] Formulaire complété
- [ ] Compte créé avec succès
- [ ] Vérification dans la base de données
- [ ] Connexion réussie

---

## 🚀 APRÈS LE PREMIER COMPTE

Une fois connecté, vous pouvez :

1. **Voir votre profil** → Cliquer sur "Profil"
2. **Publier une annonce** → Cliquer sur "+" (Publier)
3. **Ajouter aux favoris** → Cliquer sur ❤️ sur une annonce
4. **Envoyer un message** → Contacter un vendeur

---

## 📞 COMMANDES UTILES

### Récupérer le code OTP
```powershell
.\get-otp.ps1
```

### Voir les logs backend en temps réel
```powershell
docker logs -f planb_api
```

### Redémarrer le backend
```powershell
docker restart planb_api
```

### Vérifier les utilisateurs
```powershell
docker exec planb_postgres psql -U postgres -d planb -c "SELECT * FROM users;"
```

---

## ⏱️ TIMELINE ATTENDUE

- **0:00** - Ouvrir page inscription
- **0:10** - Entrer numéro
- **0:20** - Cliquer "Recevoir le code"
- **0:30** - Récupérer code OTP (logs)
- **0:40** - Entrer code OTP
- **0:50** - Compléter formulaire
- **1:50** - Cliquer "Créer mon compte"
- **2:00** - ✅ **COMPTE CRÉÉ**

---

**COMMENCEZ MAINTENANT ! 🚀**

Ouvrez : http://localhost:5173/auth/register-otp
