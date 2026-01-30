# 🤖 Installation du Service IA - Plan B

Guide d'installation rapide du service d'intelligence artificielle pour Plan B.

## ⚡ Installation Rapide

### Windows

1. **Ouvrir PowerShell** dans le dossier `planb-ai`

2. **Exécuter le script de démarrage** :
```powershell
.\start.bat
```

### Linux/Mac

1. **Ouvrir un terminal** dans le dossier `planb-ai`

2. **Rendre le script exécutable** :
```bash
chmod +x start.sh
```

3. **Exécuter le script** :
```bash
./start.sh
```

## 📋 Installation Manuelle

### 1. Prérequis

- Python 3.8 ou supérieur
- pip (gestionnaire de paquets Python)

Vérifier l'installation :
```bash
python --version  # Doit afficher 3.8+
pip --version
```

### 2. Créer l'environnement virtuel

```bash
cd planb-ai
python -m venv venv
```

### 3. Activer l'environnement virtuel

**Windows** :
```bash
venv\Scripts\activate
```

**Linux/Mac** :
```bash
source venv/bin/activate
```

### 4. Installer les dépendances

```bash
pip install -r requirements.txt
```

⚠️ **Note** : L'installation peut prendre plusieurs minutes car elle télécharge des modèles ML.

### 5. Configurer l'environnement

```bash
cp .env.example .env
```

Éditer `.env` si nécessaire (les valeurs par défaut fonctionnent).

### 6. Démarrer le service

```bash
python app.py
```

Le service sera accessible sur `http://localhost:5000`

## ✅ Vérification

Tester que le service fonctionne :

```bash
curl http://localhost:5000/health
```

Vous devriez recevoir :
```json
{
  "status": "healthy",
  "service": "Plan B AI Service",
  "version": "1.0.0"
}
```

## 🔧 Configuration Backend PHP

Dans `planb-backend/.env`, ajouter :

```env
AI_SERVICE_URL=http://localhost:5000
```

## 🚀 Production

Pour la production, utilisez Gunicorn :

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 app:app
```

## 🐳 Docker (Optionnel)

Créer un `Dockerfile` :

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "--timeout", "120", "app:app"]
```

Construire et lancer :
```bash
docker build -t planb-ai .
docker run -p 5000:5000 planb-ai
```

## 🚨 Problèmes Courants

### Erreur "Module not found"
- Vérifier que l'environnement virtuel est activé
- Réinstaller les dépendances : `pip install -r requirements.txt`

### Erreur "Port already in use"
- Changer le port dans `.env` : `AI_SERVICE_PORT=5001`
- Ou arrêter le processus utilisant le port 5000

### Modèles ne se téléchargent pas
- Vérifier la connexion internet
- Vérifier l'espace disque disponible (modèles ~500MB)
- Télécharger manuellement si nécessaire

## 📚 Documentation

- Guide d'intégration : `INTEGRATION_IA_GUIDE.md`
- README du service : `planb-ai/README.md`

---

**Le service IA est maintenant installé et prêt ! 🎉**
