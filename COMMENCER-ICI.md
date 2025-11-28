# 🎉 BIENVENUE SUR PLAN B !

**Plateforme de petites annonces pour l'Afrique de l'Ouest**

---

## ⚡ DÉMARRAGE ULTRA-RAPIDE (30 secondes)

### 1️⃣ Première Fois ? Installation Complète

```powershell
cd "c:\Users\Elohim Mickael\Documents\plan-b"
.\DEMARRAGE\4-INSTALLATION-COMPLETE.ps1
```

### 2️⃣ Lancer l'Application

```powershell
.\DEMARRAGE\DEMARRER.ps1
```

### 3️⃣ Ouvrir dans le Navigateur

👉 **http://localhost:5173**

---

## 📚 DOCUMENTATION COMPLÈTE

**Tout est dans le dossier `DEMARRAGE/` :**

- 📖 `README.md` - Guide complet (à lire en premier)
- ⚡ `DEMARRAGE-RAPIDE.md` - Version courte
- 📚 `INDEX.md` - Vue d'ensemble de tous les scripts
- 🐳 `GUIDE-DOCKER.md` - Guide Docker détaillé

---

## 🎯 UTILISATION QUOTIDIENNE

```powershell
# Matin - Démarrer tout
.\DEMARRAGE\DEMARRER.ps1

# ... Travailler sur http://localhost:5173 ...

# Soir - Tout arrêter
.\DEMARRAGE\ARRETER.ps1
```

---

## 🛠️ SCRIPTS DISPONIBLES

| Script | Usage |
|--------|-------|
| `DEMARRER.ps1` | Lance tous les serveurs |
| `ARRETER.ps1` | Arrête tous les serveurs |
| `VERIFIER.ps1` | Vérifie l'état du système |
| `DIAGNOSTIC-COMPLET.ps1` | Diagnostic complet |
| `NETTOYER-DOCKER.ps1` | Nettoie Docker |

---

## 🌐 SERVEURS & PORTS

| Service | URL | Port |
|---------|-----|------|
| **Frontend (React)** | http://localhost:5173 | 5173 |
| **Backend (Symfony)** | http://localhost:8000 | 8000 |
| **PostgreSQL** | localhost | 5432 |

---

## ✅ PRÉREQUIS (À INSTALLER AVANT)

- ✅ Docker Desktop
- ✅ PHP 8.2+ avec Composer
- ✅ Node.js 18+ avec npm
- ✅ PowerShell

### Vérifier les Prérequis

```powershell
.\DEMARRAGE\DIAGNOSTIC-COMPLET.ps1
```

---

## 🆘 PROBLÈME ? AIDE RAPIDE

### Serveurs ne démarrent pas

```powershell
.\DEMARRAGE\DIAGNOSTIC-COMPLET.ps1
```

### Erreurs étranges

```powershell
# 1. Tout arrêter
.\DEMARRAGE\ARRETER.ps1

# 2. Attendre 5 secondes

# 3. Redémarrer
.\DEMARRAGE\DEMARRER.ps1
```

### PostgreSQL ne marche pas

```powershell
docker ps -a
docker restart planb-postgres
```

---

## 📁 STRUCTURE DU PROJET

```
plan-b/
├── DEMARRAGE/              ⭐ Tous les scripts de gestion
├── planb-backend/          🔧 API Symfony
├── planb-frontend/         💻 Interface React
├── ARCHIVE_DOCUMENTATION/  📚 Documentation historique
└── COMMENCER-ICI.md        👈 Vous êtes ici !
```

---

## 🎨 FONCTIONNALITÉS

- ✅ Authentification (inscription/connexion)
- ✅ Publication d'annonces avec images
- ✅ Recherche et filtres
- ✅ Favoris
- ✅ Messagerie WhatsApp
- ✅ Profil utilisateur
- ✅ Responsive mobile
- 🚧 Paiements Mobile Money (en cours)

---

## 💡 CONSEILS

1. **Toujours utiliser les scripts** du dossier `DEMARRAGE/`
2. **Ne jamais fermer brutalement** les fenêtres PowerShell
3. **Arrêter proprement** en fin de journée avec `ARRETER.ps1`
4. **En cas de doute**, lancer `DIAGNOSTIC-COMPLET.ps1`

---

## 🚀 PROCHAINES ÉTAPES

### Après le démarrage :

1. Ouvrir http://localhost:5173
2. Créer un compte utilisateur
3. Explorer l'interface
4. Publier une annonce de test
5. Tester les fonctionnalités

### Pour le développement :

1. Lire `DEMARRAGE/README.md`
2. Consulter `README.md` du projet
3. Modifier le code
4. Les serveurs se rechargent automatiquement

---

## 📞 RESSOURCES

- **Documentation Backend** : `planb-backend/README.md`
- **Documentation Frontend** : `planb-frontend/README.md`
- **Guide Docker** : `DEMARRAGE/GUIDE-DOCKER.md`
- **Archive** : `ARCHIVE_DOCUMENTATION/` (anciens guides)

---

## 🎯 COMMANDE MAGIQUE

**Une seule commande pour tout faire :**

```powershell
.\DEMARRAGE\DEMARRER.ps1
```

**C'est tout ! 🎉**

---

**Bon développement ! 💻✨**

*Plan B - Fait avec ❤️ pour l'Afrique de l'Ouest 🌍*
