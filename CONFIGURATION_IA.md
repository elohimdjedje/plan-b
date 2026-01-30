# ⚙️ Configuration du Service IA - Plan B

## 📋 Variables d'Environnement

### Backend PHP (`planb-backend/.env`)

Ajouter la ligne suivante :

```env
# Service IA Python
AI_SERVICE_URL=http://localhost:5000
```

**Note** : Si le service IA n'est pas disponible, le backend continuera de fonctionner normalement avec des méthodes basiques.

### Service IA Python (`planb-ai/.env`)

Créer le fichier `.env` à partir de `.env.example` :

```env
# Port du service Flask
AI_SERVICE_PORT=5000

# Mode debug (True pour développement, False pour production)
FLASK_DEBUG=False

# URL du backend PHP (pour les callbacks si nécessaire)
BACKEND_URL=http://localhost:8000

# Clé API pour sécuriser les requêtes (optionnel)
API_KEY=your_secret_api_key_here

# Configuration des modèles
MODEL_CACHE_DIR=./models
EMBEDDING_MODEL=paraphrase-multilingual-MiniLM-L12-v2

# Niveau de logging
LOG_LEVEL=INFO
```

## 🔧 Configuration Avancée

### Changer le Port

Si le port 5000 est déjà utilisé :

1. **Service IA** : Modifier `AI_SERVICE_PORT=5001` dans `planb-ai/.env`
2. **Backend PHP** : Modifier `AI_SERVICE_URL=http://localhost:5001` dans `planb-backend/.env`

### Production

Pour la production, utilisez Gunicorn :

```bash
cd planb-ai
gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 app:app
```

Ou avec Docker :

```bash
cd planb-ai
docker-compose up -d
```

## ✅ Vérification

Après configuration, vérifier que tout fonctionne :

```bash
# 1. Service IA
curl http://localhost:5000/health

# 2. Backend peut se connecter
# Vérifier les logs du backend PHP
# Vous devriez voir des appels au service IA dans les logs
```

## 🚨 Dépannage

### Le backend ne peut pas se connecter au service IA

1. Vérifier que le service IA est démarré
2. Vérifier `AI_SERVICE_URL` dans `.env`
3. Vérifier les règles de firewall
4. Tester manuellement : `curl http://localhost:5000/health`

### Le service IA ne démarre pas

1. Vérifier Python 3.8+ : `python --version`
2. Vérifier les dépendances : `pip list`
3. Réinstaller si nécessaire : `pip install -r requirements.txt`
4. Vérifier les logs d'erreur

### Les modèles ne se téléchargent pas

1. Vérifier la connexion internet
2. Vérifier l'espace disque (modèles ~500MB)
3. Télécharger manuellement si nécessaire

---

**Configuration terminée ! Le service IA est prêt à être utilisé. 🚀**
