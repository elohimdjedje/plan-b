# 📚 INDEX COMPLET - DOSSIER DEMARRAGE

**Tous les outils pour gérer Plan B facilement**

---

## 🚀 Démarrage & Arrêt

| Script | Description | Quand l'utiliser |
|--------|-------------|------------------|
| `DEMARRER.ps1` | **Lance tout** | Chaque jour pour travailler |
| `ARRETER.ps1` | **Arrête tout** | Fin de journée |
| `VERIFIER.ps1` | **Vérifie l'état** | En cas de doute |

---

## 🔧 Installation & Configuration

| Script | Description | Quand l'utiliser |
|--------|-------------|------------------|
| `4-INSTALLATION-COMPLETE.ps1` | **Installation complète** | Première utilisation uniquement |
| `DIAGNOSTIC-COMPLET.ps1` | **Diagnostic système** | Problèmes de démarrage |

---

## 🧹 Maintenance

| Script | Description | Quand l'utiliser |
|--------|-------------|------------------|
| `NETTOYER-DOCKER.ps1` | **Nettoie Docker** | Trop de conteneurs arrêtés |

---

## 📖 Documentation

| Fichier | Contenu |
|---------|---------|
| `README.md` | **Guide complet** - Tout savoir |
| `DEMARRAGE-RAPIDE.md` | **Guide express** - Essentiel |
| `GUIDE-DOCKER.md` | **Guide Docker** - Détails techniques |
| `INDEX.md` | **Ce fichier** - Vue d'ensemble |

---

## 🎯 Scénarios d'Utilisation

### 📅 Utilisation Quotidienne

```powershell
# Matin - Démarrer
.\DEMARRAGE\DEMARRER.ps1

# Travailler...
# http://localhost:5173

# Soir - Arrêter
.\DEMARRAGE\ARRETER.ps1
```

### 🆕 Première Installation

```powershell
# 1. Installation
.\DEMARRAGE\4-INSTALLATION-COMPLETE.ps1

# 2. Démarrer
.\DEMARRAGE\DEMARRER.ps1

# 3. Ouvrir le navigateur
start http://localhost:5173
```

### 🔍 Diagnostic de Problème

```powershell
# 1. Diagnostic
.\DEMARRAGE\DIAGNOSTIC-COMPLET.ps1

# 2. Vérifier l'état
.\DEMARRAGE\VERIFIER.ps1

# 3. Si besoin, redémarrer
.\DEMARRAGE\ARRETER.ps1
.\DEMARRAGE\DEMARRER.ps1
```

### 🧹 Nettoyage Périodique

```powershell
# Une fois par semaine
.\DEMARRAGE\NETTOYER-DOCKER.ps1
```

---

## 🌐 URLs Importantes

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Application principale |
| **Backend** | http://localhost:8000 | API REST |
| **Adminer** | docker exec planb-postgres... | Admin DB |

---

## ⚡ Raccourcis Clavier Utiles

Dans les fenêtres PowerShell :
- `Ctrl + C` - Arrêter le serveur
- `Ctrl + L` - Effacer la console
- Fermer la fenêtre - Arrête le serveur

---

## 🆘 Aide Rapide

### Problème de port

```powershell
# Arrêter tout
.\DEMARRAGE\ARRETER.ps1

# Attendre 5 secondes

# Redémarrer
.\DEMARRAGE\DEMARRER.ps1
```

### PostgreSQL ne démarre pas

```powershell
# Vérifier Docker
docker ps -a

# Redémarrer
docker restart planb-postgres
```

### Frontend affiche des erreurs

```powershell
# Vérifier que le backend est lancé
.\DEMARRAGE\VERIFIER.ps1

# Vérifier l'API
curl http://localhost:8000
```

---

## 📊 Commandes de Vérification

```powershell
# Processus en cours
Get-Process php, node -ErrorAction SilentlyContinue

# Conteneurs Docker
docker ps

# Ports utilisés
netstat -ano | findstr "5173 8000 5432"

# Diagnostic complet
.\DEMARRAGE\DIAGNOSTIC-COMPLET.ps1
```

---

## 💡 Conseils & Astuces

### ✅ Bonnes Pratiques

1. **Toujours utiliser les scripts** - Pas de commandes manuelles
2. **Vérifier l'état** - Avant de rapporter un bug
3. **Arrêter proprement** - `ARRETER.ps1` en fin de journée
4. **Diagnostic régulier** - Une fois par semaine

### ⚠️ À Éviter

1. ❌ Fermer brutalement les fenêtres PowerShell
2. ❌ Modifier les ports sans raison
3. ❌ Supprimer les conteneurs manuellement
4. ❌ Lancer plusieurs fois les serveurs

### 🎯 Optimisations

- **Docker Desktop** - Limiter à 2 CPU / 2GB RAM
- **Windows** - Ajouter une exception antivirus pour le dossier
- **PowerShell** - Exécuter en tant qu'administrateur si erreurs

---

## 📞 Support

En cas de problème non résolu :

1. Lancer `DIAGNOSTIC-COMPLET.ps1`
2. Copier les résultats
3. Consulter `README.md` pour plus de détails
4. Vérifier `GUIDE-DOCKER.md` pour les problèmes Docker

---

## 🔄 Mise à Jour du Code

```powershell
# 1. Arrêter les serveurs
.\DEMARRAGE\ARRETER.ps1

# 2. Faire vos modifications de code

# 3. Redémarrer
.\DEMARRAGE\DEMARRER.ps1
```

---

## 📝 Structure du Dossier

```
DEMARRAGE/
├── DEMARRER.ps1                    ⭐ Script principal
├── ARRETER.ps1                     🛑 Arrêt
├── VERIFIER.ps1                    ✅ Vérification
├── 4-INSTALLATION-COMPLETE.ps1     🔧 Installation
├── DIAGNOSTIC-COMPLET.ps1          🔍 Diagnostic
├── NETTOYER-DOCKER.ps1             🧹 Nettoyage
├── README.md                       📖 Guide complet
├── DEMARRAGE-RAPIDE.md             ⚡ Guide express
├── GUIDE-DOCKER.md                 🐳 Guide Docker
└── INDEX.md                        📚 Ce fichier
```

---

**✨ Tout est prêt ! Utilisez `DEMARRER.ps1` pour commencer.**
