# 🚀 DÉMARRAGE SIMPLE - 5 ÉTAPES

## ⚡ CE QUE VOUS DEVEZ FAIRE (DANS L'ORDRE)

---

## ÉTAPE 1 : VÉRIFIER DOCKER

**Vérifiez que vos 3 containers Docker tournent :**

```powershell
docker ps
```

**Vous devez voir :**
- ✅ `planb-backend`
- ✅ `planb_admin`  
- ✅ `planb_postgre`

**Si ce n'est pas le cas :**
```powershell
cd c:\Users\Elohim Mickael\Documents\plan-b\planb-backend
docker-compose up -d
```

---

## ÉTAPE 2 : MIGRER VERS LA PRODUCTION

**Double-cliquez sur ce fichier :**
```
c:\Users\Elohim Mickael\Documents\plan-b\planb-frontend\migration-production-rapide.bat
```

**Ce script va :**
- ✅ Sauvegarder vos fichiers actuels
- ✅ Copier les fichiers de production
- ✅ Vérifier la configuration

---

## ÉTAPE 3 : LANCER LE FRONTEND

**Ouvrez PowerShell et tapez :**

```powershell
cd c:\Users\Elohim Mickael\Documents\plan-b\planb-frontend
npm run dev
```

**Attendez de voir :**
```
➜  Local:   http://localhost:5174/
```

---

## ÉTAPE 4 : TESTER L'INSCRIPTION

**1. Ouvrez votre navigateur :**
```
http://localhost:5174/auth/register
```

**2. Inscrivez-vous :**
```
Nom complet : Test Production
Email : test@planb.com
Téléphone : 0707123456
Mot de passe : Test123!
```

**3. Cliquez sur "Créer mon compte"**

---

## ÉTAPE 5 : VÉRIFIER DANS LA BASE DE DONNÉES

**1. Ouvrez Adminer :**
```
http://localhost:8080
```

**2. Connectez-vous avec :**
```
Système : PostgreSQL
Serveur : planb_postgre
Utilisateur : planb_user
Mot de passe : planb_password
Base de données : planb_db
```

**3. Cliquez sur :**
- `planb_db` (à gauche)
- `public`
- `Tables`
- `user`
- `Sélectionner les données`

**4. Vous devriez voir votre compte "test@planb.com" ! 🎉**

---

## ✅ VOUS AVEZ RÉUSSI SI...

- ✅ Vous voyez "Compte créé avec succès !"
- ✅ Vous êtes redirigé vers l'accueil
- ✅ Vous voyez votre compte dans Adminer
- ✅ Vous pouvez vous reconnecter avec votre email et mot de passe

---

## 🆘 SI ÇA NE FONCTIONNE PAS

### **Problème : "Connection refused"**

**Solution :**
```powershell
# Vérifier que le backend tourne
docker ps

# Redémarrer si nécessaire
docker restart planb-backend
```

---

### **Problème : Page blanche**

**Solution :**
```powershell
# Vider le cache du navigateur
# Appuyez sur Ctrl + Shift + R

# OU dans la console (F12)
localStorage.clear();
location.reload();
```

---

### **Problème : Ne vois pas le compte dans Adminer**

**Vérifier :**
1. Serveur = `planb_postgre` (PAS localhost)
2. Utilisateur = `planb_user`
3. Mot de passe = `planb_password`
4. Base de données = `planb_db`

---

## 📊 URLs IMPORTANTES

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5174 |
| **Backend** | http://localhost:8000 |
| **Adminer (BDD)** | http://localhost:8080 |

---

## 🎯 APRÈS ÇA MARCHE

### **Vous pourrez :**
- ✅ Créer un compte
- ✅ Se connecter
- ✅ Créer des annonces
- ✅ Voir tout dans Adminer
- ✅ Avoir un vrai site fonctionnel !

---

**🚀 COMMENCEZ PAR L'ÉTAPE 1 !**

*Guide simplifié créé le 9 novembre 2025*
