# 🧪 Test de l'upload d'images - Guide étape par étape

## Objectif
Vérifier si l'upload d'images fonctionne correctement et pourquoi l'annonce actuelle n'a pas d'images.

---

## 🚀 Test 1 : Créer une annonce avec une image

### Étape 1 : Préparer une image de test
- Trouvez une image JPG ou PNG sur votre ordinateur
- Taille recommandée : < 2 MB
- Format : JPG, PNG ou WEBP

### Étape 2 : Ouvrir l'application
```powershell
# Ouvrir dans le navigateur
Start-Process "http://localhost:5173"
```

### Étape 3 : Activer la console développeur
- Appuyer sur **F12** dans le navigateur
- Aller dans l'onglet **"Console"**
- Aller dans l'onglet **"Network"** (Réseau)

### Étape 4 : Publier une annonce avec image
1. Se connecter à l'application
2. Cliquer sur **"Publier une annonce"**
3. Remplir le formulaire :
   - **Catégorie** : Immobilier
   - **Type de bien** : Maison
   - **Titre** : "TEST UPLOAD IMAGE"
   - **Description** : "Ceci est un test pour vérifier l'upload d'images"
   - **Prix** : 1000000
   - **Ville** : Abidjan
   
4. **À l'étape des images** :
   - Cliquer sur "Ajouter des photos"
   - Sélectionner UNE image
   - Vérifier que la miniature s'affiche

5. Avant de cliquer "Publier" :
   - **Dans l'onglet Network** : Cocher "Preserve log"
   - Garder la console ouverte

6. Cliquer sur **"Publier"**

### Étape 5 : Observer les requêtes

**Dans l'onglet Network, vous devriez voir** :

#### Requête 1 : Upload de l'image
```
POST http://localhost:8000/api/v1/upload
Status: 200 OK (ou 201)

Réponse attendue :
{
  "success": true,
  "urls": ["/uploads/listings/abc123_456789.jpg"],
  "images": ["/uploads/listings/abc123_456789.jpg"],
  "count": 1
}
```

**✅ Si cette requête réussit** : L'upload fonctionne !

**❌ Si erreur 404** : Le endpoint upload n'est pas trouvé
**❌ Si erreur 500** : Problème serveur (vérifier les permissions)

#### Requête 2 : Création de l'annonce
```
POST http://localhost:8000/api/v1/listings
Status: 201 Created

Payload envoyé (voir onglet "Payload") :
{
  "title": "TEST UPLOAD IMAGE",
  "description": "...",
  "price": 1000000,
  "images": ["/uploads/listings/abc123_456789.jpg"],  ← IMPORTANT
  // ... autres champs
}

Réponse attendue :
{
  "message": "Annonce créée avec succès",
  "data": {
    "id": 3,
    "title": "TEST UPLOAD IMAGE",
    "mainImage": "/uploads/listings/abc123_456789.jpg",  ← IMPORTANT
    // ...
  }
}
```

**✅ Si `images` est présent dans le payload** : Le frontend envoie bien les images
**✅ Si `mainImage` est dans la réponse** : Le backend a bien enregistré l'image

---

## 🔍 Test 2 : Vérifier les fichiers uploadés

### Après avoir publié l'annonce :

```powershell
cd planb-backend

# Lister les fichiers uploadés
Get-ChildItem "public\uploads\listings\"
```

**Résultat attendu** :
```
Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a---          17/11/2025    12:50         234567 abc123_456789.jpg
```

**✅ Si le fichier existe** : L'upload a fonctionné !
**❌ Si le dossier est vide** : Le fichier n'a pas été enregistré

---

## 🗄️ Test 3 : Vérifier la base de données

```powershell
cd planb-backend

# Compter les images
php bin/console doctrine:query:sql "SELECT COUNT(*) FROM images"

# Lister les images
php bin/console doctrine:query:sql "SELECT id, url, listing_id, status FROM images"
```

**Résultat attendu** :
```
 ---- ----------------------------------------- ------------ ----------
  id   url                                       listing_id   status
 ---- ----------------------------------------- ------------ ----------
  1    /uploads/listings/abc123_456789.jpg      3            uploaded
 ---- ----------------------------------------- ------------ ----------
```

**✅ Si l'image est dans la BD** : Le backend a bien enregistré
**❌ Si la table est vide** : Le backend n'a pas créé l'entité Image

---

## 📊 Matrice de diagnostic

| Upload réussit | Fichier créé | Image en BD | Diagnostic |
|----------------|--------------|-------------|------------|
| ✅ | ✅ | ✅ | **Tout fonctionne !** |
| ✅ | ✅ | ❌ | Backend ne crée pas l'entité Image |
| ✅ | ❌ | ❌ | Problème de permissions fichiers |
| ❌ | ❌ | ❌ | Endpoint upload ne fonctionne pas |

---

## 🛠️ Si l'upload échoue

### Erreur 404 sur `/upload`

**Cause** : Le endpoint n'est pas trouvé

**Solution** :
```powershell
cd planb-backend

# Vider le cache
php bin/console cache:clear

# Redémarrer le serveur
# Arrêter avec Ctrl+C, puis :
php -S localhost:8000 -t public
```

### Erreur 500 sur `/upload`

**Cause** : Problème de permissions ou erreur PHP

**Solution 1 : Vérifier les permissions**
```powershell
cd planb-backend

# Créer le dossier s'il n'existe pas
New-Item -ItemType Directory -Force -Path "public\uploads\listings"

# Vérifier qu'il existe
Test-Path "public\uploads\listings"
```

**Solution 2 : Voir les logs d'erreur**
- Regarder dans la console où le serveur PHP tourne
- Il devrait afficher l'erreur exacte

### L'image ne s'affiche pas dans le formulaire

**Cause** : Problème frontend avec les previews

**Solution** : Vérifier la console du navigateur pour les erreurs JavaScript

---

## ✅ Scénario de succès complet

1. **Upload** : 
   - POST /upload → 200 OK
   - Fichier créé dans `public/uploads/listings/`

2. **Création** :
   - POST /listings avec `images: [...]`
   - Réponse avec `mainImage`
   
3. **Base de données** :
   - 1 entrée dans la table `images`
   - `url` contient le chemin de l'image
   
4. **Affichage** :
   - L'annonce apparaît sur l'accueil avec l'image
   - L'image est cliquable et s'affiche en grand

---

## 🎯 Pourquoi l'annonce actuelle n'a pas d'images ?

### Hypothèse la plus probable : ❌ Pas d'images sélectionnées

L'utilisateur a publié l'annonce **sans sélectionner de photos**.

**Indices** :
- ✅ Backend fonctionne (l'annonce a été créée)
- ✅ Upload Controller existe
- ❌ 0 images dans la table `images`
- ❌ Dossier `uploads/listings` vide

**Conclusion** : Le système fonctionne, mais aucune image n'a été uploadée pour cette annonce.

### Comment le confirmer ?

Faire le **Test 1** ci-dessus :
- Si l'upload fonctionne → Confirmé, l'annonce a été créée sans images
- Si l'upload échoue → Il y a un bug à corriger

---

## 📝 Rapport de test

Après avoir fait les tests, remplissez ce rapport :

```
Date du test : ___________
Navigateur   : ___________

✅ / ❌  Ouverture de l'application
✅ / ❌  Formulaire de publication accessible
✅ / ❌  Sélection d'image possible
✅ / ❌  Miniature affichée
✅ / ❌  Requête POST /upload réussie
✅ / ❌  Réponse contient des URLs
✅ / ❌  Requête POST /listings avec images
✅ / ❌  Fichier créé dans uploads/
✅ / ❌  Image dans la base de données
✅ / ❌  Image affichée sur l'annonce

Notes / Erreurs :
_______________________
_______________________
_______________________
```

---

## 🚀 Action immédiate

**Faites le Test 1 maintenant** pour savoir si le système d'upload fonctionne !

Si le test réussit → Le problème était juste que l'annonce n'avait pas d'images
Si le test échoue → Partagez les erreurs de la console et on corrigera

**La documentation complète est dans `DIAGNOSTIC_IMAGES_MANQUANTES.md`**
