# 🚀 GUIDE DE DEMARRAGE RAPIDE - PLAN B

## ⚡ Commande Unique pour Démarrer

```powershell
.\DEMARRAGE\DEMARRER.ps1
```

C'est tout ! Cette commande unique :
- ✅ Arrête les serveurs existants
- ✅ Démarre PostgreSQL (Docker)
- ✅ Démarre le Backend Symfony (port 8000)
- ✅ Démarre le Frontend React (port 5173)

## 📱 Accéder à l'Application

Après le démarrage, ouvrez votre navigateur :

**👉 http://localhost:5173**

## 🛑 Arrêter l'Application

```powershell
.\DEMARRAGE\ARRETER.ps1
```

## ✅ Vérifier l'État

```powershell
.\DEMARRAGE\VERIFIER.ps1
```

## 🔧 Première Installation (une seule fois)

Si c'est votre première utilisation :

```powershell
.\DEMARRAGE\4-INSTALLATION-COMPLETE.ps1
```

Puis :

```powershell
.\DEMARRAGE\DEMARRER.ps1
```

## 📊 Serveurs Lancés

| Service | URL | Port |
|---------|-----|------|
| **Frontend** | http://localhost:5173 | 5173 |
| **Backend API** | http://localhost:8000 | 8000 |
| **PostgreSQL** | localhost | 5432 |

## 💡 Astuces

- Les serveurs Backend et Frontend s'ouvrent dans des fenêtres PowerShell séparées
- Vous pouvez voir les logs en temps réel dans ces fenêtres
- Pour arrêter proprement, utilisez toujours `ARRETER.ps1`
- Le script gère automatiquement les conflits de ports

## 🆘 En cas de Problème

### Port déjà utilisé
```powershell
# Arrêtez tout et redémarrez
.\DEMARRAGE\ARRETER.ps1
.\DEMARRAGE\DEMARRER.ps1
```

### PostgreSQL ne démarre pas
```powershell
# Redémarrez le conteneur Docker
docker restart planb-postgres
```

### Erreur générale
```powershell
# Vérifiez l'état
.\DEMARRAGE\VERIFIER.ps1
```

---

**🎯 Vous êtes prêt à développer !**
