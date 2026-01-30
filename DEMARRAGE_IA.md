# 🚀 Démarrage Rapide - Service IA Plan B

## ⚡ Démarrage en 3 étapes

### 1. Installer Python (si pas déjà installé)

**Windows** :
- Télécharger depuis https://www.python.org/downloads/
- Cocher "Add Python to PATH" lors de l'installation

**Linux/Mac** :
```bash
# Vérifier si Python est installé
python3 --version
```

### 2. Démarrer le service IA

**Windows** :
```powershell
cd planb-ai
.\start.bat
```

**Linux/Mac** :
```bash
cd planb-ai
chmod +x start.sh
./start.sh
```

### 3. Configurer le backend PHP

Dans `planb-backend/.env`, ajouter :
```env
AI_SERVICE_URL=http://localhost:5000
```

Redémarrer le backend PHP.

## ✅ Vérification

Tester que tout fonctionne :

```bash
# 1. Vérifier le service IA
curl http://localhost:5000/health

# 2. Tester la catégorisation
curl -X POST http://localhost:5000/categorize \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"Villa 4 chambres avec piscine\"}"
```

## 🎯 Utilisation

Une fois démarré, l'IA est automatiquement utilisée pour :
- ✅ Catégoriser les annonces si non spécifié
- ✅ Détecter le spam avant publication
- ✅ Améliorer les résultats de recherche
- ✅ Suggérer des annonces similaires

## 🚨 Problèmes ?

Voir `INSTALLATION_IA.md` pour le dépannage détaillé.

---

**C'est tout ! Le service IA est maintenant actif. 🎉**
