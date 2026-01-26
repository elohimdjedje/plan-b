# 🖼️ Solution : Pourquoi vos images ne s'affichent pas

## ❌ Le problème réel

Vos images ne s'affichent **PAS** à cause de PostgreSQL.
PostgreSQL n'est tout simplement **pas démarré** !

```
❌ PostgreSQL arrêté
❌ Backend ne peut pas se connecter à la BD
❌ Pas d'annonces récupérées
❌ Donc pas d'images affichées
```

## ✅ La solution

### Étape 1 : Démarrer PostgreSQL

**Option A : Avec Docker (RECOMMANDÉ)**

```powershell
# Exécuter ce script
.\start-postgres.ps1
```

OU manuellement :

```powershell
docker run -d `
  --name planb-postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=root `
  -e POSTGRES_DB=planb `
  -p 5432:5432 `
  postgres:15-alpine
```

**Option B : Sans Docker**

Lisez le fichier `DEMARRER_POSTGRESQL.md` pour installer PostgreSQL localement.

### Étape 2 : Démarrer toute l'application

```powershell
# Démarrer PostgreSQL + Backend + Frontend en une commande
.\start-all.ps1
```

### Étape 3 : Vérifier que tout fonctionne

1. Ouvrir : http://localhost:5173
2. Les images devraient s'afficher si :
   - PostgreSQL est démarré ✅
   - Le backend tourne ✅
   - Des annonces existent dans la BD ✅

---

## 📊 Comprendre le stockage des images

### Comment ça marche actuellement

```
┌─────────────────────────────────────────────────┐
│ 1. Upload d'image                               │
│    └─> POST /api/v1/upload                      │
│        └─> Fichier enregistré dans              │
│            /public/uploads/listings/             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. PostgreSQL stocke                            │
│    └─> URL: "/uploads/listings/abc123.jpg"      │
│    └─> PAS le fichier lui-même !                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. Frontend récupère l'annonce                  │
│    └─> GET /api/v1/listings/1                   │
│        └─> Reçoit l'URL de l'image              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. Navigateur charge l'image                    │
│    └─> http://localhost:8000/uploads/.../image  │
└─────────────────────────────────────────────────┘
```

### PostgreSQL stocke UNIQUEMENT

```sql
-- Table: images
id  | listing_id | url                                  | uploaded_at
----|------------|--------------------------------------|------------
1   | 1          | /uploads/listings/abc123.jpg         | 2025-11-17
2   | 1          | /uploads/listings/def456.jpg         | 2025-11-17
```

**PostgreSQL ne stocke PAS les fichiers images !**
Il stocke juste le chemin (texte) vers l'image.

### Les fichiers physiques sont dans

```
planb-backend/
  public/
    uploads/
      listings/
        abc123.jpg  ← Le fichier réel
        def456.jpg  ← Le fichier réel
```

---

## 🔍 Diagnostic rapide

### Test 1 : PostgreSQL fonctionne ?

```powershell
cd planb-backend
php bin/console doctrine:query:sql "SELECT 1"
```

**Résultat attendu** :
```
[
    [1 => 1]
]
```

**Si erreur "Connection refused"** :
- ❌ PostgreSQL n'est pas démarré
- ✅ Exécutez : `.\start-postgres.ps1`

### Test 2 : Y a-t-il des annonces ?

```powershell
php bin/console doctrine:query:sql "SELECT COUNT(*) FROM listings"
```

**Si 0** :
- Créez une annonce depuis le frontend
- Ou importez des données de test

### Test 3 : Y a-t-il des images physiques ?

```powershell
Get-ChildItem "public\uploads\listings\"
```

**Si vide** :
- Uploadez des images depuis le frontend
- Les images apparaîtront ici après l'upload

### Test 4 : Le backend sert les fichiers ?

Ouvrir dans le navigateur :
```
http://localhost:8000/uploads/listings/[nom_fichier].jpg
```

---

## ⚡ Démarrage rapide (tout en un)

```powershell
# 1. Démarrer tout
.\start-all.ps1

# 2. Ouvrir l'application
# http://localhost:5173

# 3. Créer une annonce avec des images
```

---

## 🚨 Erreurs courantes

### Erreur : "Connection refused"
**Cause** : PostgreSQL n'est pas démarré
**Solution** : `.\start-postgres.ps1`

### Erreur : "Port 8000 already in use"
**Cause** : Backend déjà démarré
**Solution** : C'est normal, continuez

### Erreur : "Images ne s'affichent pas"
**Causes possibles** :
1. PostgreSQL arrêté → Démarrer PostgreSQL
2. Backend arrêté → Démarrer le backend
3. Pas d'annonces dans la BD → Créer des annonces
4. Pas d'images uploadées → Uploader des images

---

## 📝 Récapitulatif

| Composant | Rôle | Stockage images |
|-----------|------|-----------------|
| **PostgreSQL** | Stocke les URLs et métadonnées | ❌ Non |
| **Backend (Symfony)** | Gère l'upload et sert les fichiers | ✅ Oui (dans /public/uploads) |
| **Frontend (React)** | Affiche les images | ❌ Non |

**PostgreSQL est PARFAIT pour votre projet !**
Ne changez pas de base de données. Il faut juste la démarrer.

---

## 🎯 Checklist avant de dire "les images ne marchent pas"

- [ ] PostgreSQL est démarré (`docker ps` ou service actif)
- [ ] Backend tourne sur http://localhost:8000
- [ ] Frontend tourne sur http://localhost:5173
- [ ] Des annonces existent dans la BD
- [ ] Des images ont été uploadées
- [ ] Le dossier `/public/uploads/listings/` contient des fichiers

**Si tous ces points sont ✅, les images DOIVENT s'afficher.**

---

## 💡 Pour la production

En production, remplacez le stockage local par **Cloudinary** :

1. Créer un compte gratuit sur https://cloudinary.com
2. Obtenir vos clés API
3. Configurer dans `.env` :
   ```env
   CLOUDINARY_CLOUD_NAME=votre_cloud_name
   CLOUDINARY_API_KEY=votre_api_key
   CLOUDINARY_API_SECRET=votre_api_secret
   ```
4. Modifier `UploadController.php` pour utiliser Cloudinary

**Avantages** :
- ✅ CDN mondial ultra-rapide
- ✅ Images jamais perdues
- ✅ Compression automatique
- ✅ Transformation à la volée

---

## 🆘 Besoin d'aide ?

1. Vérifier que PostgreSQL est démarré
2. Lire les logs d'erreur du backend
3. Ouvrir la console du navigateur (F12)
4. Vérifier les requêtes réseau (onglet Network)

**Le problème n'est JAMAIS PostgreSQL lui-même, c'est toujours la configuration !**
