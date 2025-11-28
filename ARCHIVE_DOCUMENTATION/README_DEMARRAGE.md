# 🎯 PLAN B - DÉMARRAGE PRODUCTION

## 📌 SITUATION

Vous avez :
- ✅ Docker Desktop avec 3 containers
- ✅ Backend Symfony (planb-backend)
- ✅ Base de données PostgreSQL (planb_postgre)
- ✅ Adminer pour voir la BDD (planb_admin)
- ✅ Frontend React (planb-frontend)

Vous voulez :
- ✅ Produit final fonctionnel
- ✅ Authentification réelle (pas localStorage)
- ✅ Voir les comptes créés dans Docker

---

## 🚀 DÉMARRAGE EN 3 ÉTAPES

### **ÉTAPE 1 : Lancer le script de migration**

**Double-cliquez sur :**
```
planb-frontend\migration-production-rapide.bat
```

**Ou en PowerShell :**
```powershell
cd c:\Users\Elohim Mickael\Documents\plan-b\planb-frontend
.\migration-production-rapide.bat
```

---

### **ÉTAPE 2 : Lancer le frontend**

```powershell
cd c:\Users\Elohim Mickael\Documents\plan-b\planb-frontend
npm run dev
```

---

### **ÉTAPE 3 : Tester**

**1. Créer un compte :**
```
http://localhost:5174/auth/register
```

**2. Voir le compte dans la base de données :**
```
http://localhost:8080
```

**Connexion Adminer :**
- Système : PostgreSQL
- Serveur : `planb_postgre`
- Utilisateur : `planb_user`
- Mot de passe : `planb_password`
- Base de données : `planb_db`

**3. Cliquez sur `user` dans la liste des tables**

**Vous verrez tous les comptes créés ! 🎉**

---

## 📚 DOCUMENTATION

### **Guides disponibles :**

| Fichier | Description |
|---------|-------------|
| **DEMARRAGE_SIMPLE.md** | Guide en 5 étapes (COMMENCEZ PAR LÀ) |
| **GUIDE_PRODUCTION_COMPLET.md** | Guide détaillé complet |
| **INDEX_DOCUMENTATION.md** | Index de toute la documentation |

---

## 🆘 AIDE RAPIDE

### **Comment voir les comptes créés ?**

**Méthode 1 : Adminer (Interface Web)**
```
1. Aller sur http://localhost:8080
2. Se connecter (voir infos ci-dessus)
3. Cliquer sur "user" dans les tables
4. Voir tous les comptes !
```

**Méthode 2 : Ligne de commande**
```powershell
docker exec -it planb_postgre psql -U planb_user -d planb_db -c "SELECT * FROM \"user\";"
```

---

### **Backend ne démarre pas ?**

```powershell
cd c:\Users\Elohim Mickael\Documents\plan-b\planb-backend
docker-compose up -d
docker logs planb-backend
```

---

### **Frontend page blanche ?**

**Dans la console du navigateur (F12) :**
```javascript
localStorage.clear();
location.reload();
```

---

## ✅ CHECKLIST

- [ ] Docker containers actifs (`docker ps`)
- [ ] Migration exécutée (`migration-production-rapide.bat`)
- [ ] Frontend lancé (`npm run dev`)
- [ ] Test inscription (http://localhost:5174/auth/register)
- [ ] Compte visible dans Adminer (http://localhost:8080)

---

## 🎯 PROCHAINES ÉTAPES

### **Une fois que ça marche :**

1. ✅ Créer plusieurs comptes de test
2. ✅ Créer des annonces
3. ✅ Tester les favoris
4. ✅ Tester les paiements
5. ✅ Déployer en production

---

## 📊 URLs

| Service | URL | Utilité |
|---------|-----|---------|
| Frontend | http://localhost:5174 | Votre site |
| Backend | http://localhost:8000 | API |
| Adminer | http://localhost:8080 | Base de données |

---

## 💡 ASTUCES

### **Voir les logs en temps réel :**
```powershell
docker logs -f planb-backend
```

### **Redémarrer le backend :**
```powershell
docker restart planb-backend
```

### **Voir toutes les tables :**
```sql
-- Dans Adminer, onglet "SQL", exécuter :
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

---

**🚀 COMMENCEZ PAR LIRE : `DEMARRAGE_SIMPLE.md`**

*Guide créé le 9 novembre 2025*
