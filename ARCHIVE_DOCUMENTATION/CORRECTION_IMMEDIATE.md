# 🔧 CORRECTION IMMÉDIATE

## ❌ PROBLÈME IDENTIFIÉ

1. **Le backend n'est pas lancé** - Il manque le container `planb_api`
2. **Mauvais identifiants Adminer** - Vous utilisez les mauvais paramètres

---

## ✅ SOLUTION RAPIDE

### **ÉTAPE 1 : Lancer TOUS les containers**

**Ouvrez PowerShell et tapez :**

```powershell
cd c:\Users\Elohim Mickael\Documents\plan-b\planb-backend
docker-compose up -d
```

**Attendez 30 secondes que tout démarre.**

---

### **ÉTAPE 2 : Vérifier que tout tourne**

```powershell
docker ps
```

**Vous DEVEZ voir 3 containers :**
- ✅ `planb_postgres` (base de données)
- ✅ `planb_adminer` (interface web)
- ✅ `planb_api` (backend Symfony) ⭐ **CELUI-CI MANQUAIT !**

---

### **ÉTAPE 3 : Se connecter à Adminer avec les BONS paramètres**

**Allez sur :**
```
http://localhost:8080
```

**UTILISEZ CES IDENTIFIANTS (PAS CEUX D'AVANT) :**

```
Système : PostgreSQL
Serveur : planb_postgres    ⭐ (nom du container)
Utilisateur : postgres       ⭐ (PAS admin)
Mot de passe : root          ⭐ (PAS planb_password)
Base de données : planb      ⭐ (PAS planb_db)
```

**Cliquez sur "Authentification"**

---

## 🎯 APRÈS CONNEXION

### **Vous devriez voir :**
- Tables à gauche : `user`, `listing`, `payment`, etc.

### **Pour voir les utilisateurs :**
1. Cliquer sur `public` (à gauche)
2. Cliquer sur `user`
3. Cliquer sur "Sélectionner les données"

---

## ⚠️ SI LE BACKEND NE DÉMARRE PAS

### **Voir les logs :**
```powershell
docker logs planb_api
```

### **Si vous voyez des erreurs, essayez :**
```powershell
cd c:\Users\Elohim Mickael\Documents\plan-b\planb-backend
docker-compose down
docker-compose up -d --build
```

---

## 📊 RÉCAPITULATIF

### **VRAIS IDENTIFIANTS :**

| Paramètre | Valeur |
|-----------|--------|
| **Système** | PostgreSQL |
| **Serveur** | `planb_postgres` |
| **Utilisateur** | `postgres` |
| **Mot de passe** | `root` |
| **Base de données** | `planb` |

### **CONTAINERS À AVOIR :**

| Container | Port | Statut requis |
|-----------|------|---------------|
| `planb_postgres` | 5432 | Up ✅ |
| `planb_adminer` | 8080 | Up ✅ |
| `planb_api` | 8000 | Up ✅ |

---

## 🚀 COMMANDES DANS L'ORDRE

```powershell
# 1. Aller dans le dossier backend
cd c:\Users\Elohim Mickael\Documents\plan-b\planb-backend

# 2. Lancer tous les containers
docker-compose up -d

# 3. Attendre 30 secondes

# 4. Vérifier qu'ils tournent
docker ps

# 5. Si planb_api n'apparaît pas, voir les logs
docker logs planb_api
```

---

**🎯 FAITES CES COMMANDES MAINTENANT !**

*Correction créée le 9 novembre 2025 - 16:05*
