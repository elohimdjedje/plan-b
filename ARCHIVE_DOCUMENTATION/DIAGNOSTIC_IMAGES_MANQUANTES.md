# 🔍 Diagnostic : Pourquoi l'annonce n'a pas d'images

## 📊 État actuel de l'annonce

```sql
ID: 2
Titre: "villa t5 moderne"
Catégorie: immobilier
Status: active
Créée le: 2025-11-16 à 19:58:08
Nombre d'images: 0 ❌
```

## 🔎 Investigation complète

### 1. ✅ Le code backend fonctionne correctement

Le backend gère bien les images lors de la création :

```php
// ListingController.php - Lignes 117-130
if (isset($data['images']) && is_array($data['images']) && count($data['images']) > 0) {
    $orderPosition = 0;
    foreach ($data['images'] as $imageUrl) {
        $image = new Image();
        $image->setUrl($imageUrl)
            ->setUser($user)
            ->setListing($listing)
            ->setOrderPosition($orderPosition++)
            ->setStatus('uploaded');
        
        $listing->addImage($image);
        $this->entityManager->persist($image);
    }
}
```

**✅ Le code est correct** : Il attend un tableau `images` contenant les URLs.

---

### 2. ✅ Le code frontend fonctionne correctement

Le frontend suit ce processus :

```javascript
// Publish.jsx - Lignes 101-127
// 1. Upload des images
let imageUrls = [];
if (formData.images.length > 0) {
    const uploadResult = await listingsAPI.uploadImages(imageFiles);
    imageUrls = uploadResult.urls || [];
}

// 2. Créer l'annonce avec les URLs
const listingData = {
    // ... autres champs
    images: imageUrls,  // ← URLs des images uploadées
};

await listingsAPI.createListing(listingData);
```

**✅ Le code est correct** : Il uploade d'abord les images, puis envoie les URLs.

---

### 3. ⚠️ Gestion des erreurs silencieuse

**Problème identifié** - Ligne 108-111 du frontend :

```javascript
try {
    const uploadResult = await listingsAPI.uploadImages(imageFiles);
    imageUrls = uploadResult.urls || [];
} catch (uploadError) {
    console.warn('Erreur upload images:', uploadError);
    // Continuer sans images plutôt que bloquer ← PROBLÈME ICI
}
```

**Si l'upload échoue, l'annonce est créée SANS images !**

---

## 🎯 Causes possibles

### Cause 1 : Aucune image sélectionnée ❌
L'utilisateur a publié l'annonce sans sélectionner de photos.

**Probabilité** : 80% ⚠️

### Cause 2 : Erreur d'upload silencieuse ❌
- L'upload a échoué (erreur réseau, permission, taille)
- L'erreur a été catchée silencieusement
- L'annonce a été créée sans images

**Probabilité** : 20% ⚠️

### Cause 3 : Bug du contrôleur Upload ❌
Le endpoint `/api/v1/upload` a retourné une erreur.

**Probabilité** : Faible (le code semble bon)

---

## 🧪 Tests pour identifier le problème

### Test 1 : L'upload fonctionne-t-il ?

```powershell
# Dans planb-backend
php -S localhost:8000 -t public

# Tester l'upload avec une vraie image
# (nécessite curl ou Postman)
```

**Test avec le frontend** :
1. Ouvrir http://localhost:5173
2. Cliquer "Publier une annonce"
3. Uploader UNE image
4. Ouvrir la console du navigateur (F12)
5. Regarder les requêtes réseau

**Résultat attendu** :
```
POST /api/v1/upload
Réponse: {
  "success": true,
  "urls": ["/uploads/listings/abc123.jpg"],
  "count": 1
}
```

### Test 2 : Les fichiers sont-ils créés ?

Après avoir testé l'upload :

```powershell
cd planb-backend
Get-ChildItem "public\uploads\listings\"
```

**Résultat attendu** : Des fichiers `.jpg` ou `.png`

### Test 3 : Vérifier les permissions

```powershell
cd planb-backend
# Vérifier que le dossier existe et est accessible en écriture
Test-Path "public\uploads\listings"
```

---

## 🛠️ Solutions selon le problème

### Solution 1 : Ajouter des images à l'annonce existante

**Option A : Créer une nouvelle annonce avec images**
1. Ouvrir http://localhost:5173
2. Publier une nouvelle annonce
3. **SÉLECTIONNER DES IMAGES** avant de publier
4. Vérifier que les images s'affichent

**Option B : Modifier l'annonce existante** (si fonctionnalité disponible)
- Aller dans "Mon profil"
- Modifier l'annonce "villa t5 moderne"
- Ajouter des images

---

### Solution 2 : Améliorer la gestion des erreurs

**Fichier à modifier** : `planb-frontend/src/pages/Publish.jsx`

**Changement recommandé** - Ligne 101-112 :

```javascript
// AVANT (actuel)
try {
    const uploadResult = await listingsAPI.uploadImages(imageFiles);
    imageUrls = uploadResult.urls || [];
} catch (uploadError) {
    console.warn('Erreur upload images:', uploadError);
    // Continuer sans images ← Problème
}

// APRÈS (amélioré)
try {
    const uploadResult = await listingsAPI.uploadImages(imageFiles);
    imageUrls = uploadResult.urls || uploadResult.images || [];
    
    if (!imageUrls || imageUrls.length === 0) {
        throw new Error('Aucune URL d\'image retournée');
    }
    
    toast.success(`✅ ${imageUrls.length} image(s) uploadée(s)`);
} catch (uploadError) {
    toast.dismiss();
    console.error('Erreur upload images:', uploadError);
    
    // Demander à l'utilisateur s'il veut continuer
    const continueWithoutImages = window.confirm(
        'L\'upload des images a échoué. Voulez-vous publier sans images ?'
    );
    
    if (!continueWithoutImages) {
        throw new Error('Publication annulée');
    }
}
```

**Avantages** :
- ✅ L'utilisateur est informé de l'échec
- ✅ Possibilité de corriger avant publication
- ✅ Pas de création silencieuse sans images

---

### Solution 3 : Rendre les images obligatoires

**Fichier** : `planb-frontend/src/pages/Publish.jsx`

**Changement** - Ligne 146-149 :

```javascript
const canGoNext = () => {
    if (step === 1) return formData.category;
    if (step === 2) return formData.subcategory && formData.type;
    if (step === 3) return formData.images.length > 0; // ← Rendre obligatoire
    // ...
}
```

**Ou ajouter une validation avant soumission** :

```javascript
const handleSubmit = async () => {
    // Ajouter cette vérification
    if (formData.images.length === 0) {
        toast.error('Veuillez ajouter au moins une image');
        return;
    }
    
    // ... reste du code
}
```

---

## 🔬 Test de diagnostic immédiat

### Créer une annonce de test avec images

```powershell
# 1. Ouvrir l'application
Start-Process "http://localhost:5173"

# 2. Dans le navigateur
# - Se connecter
# - Cliquer "Publier une annonce"
# - Remplir le formulaire
# - UPLOADER 1 IMAGE minimum
# - Ouvrir la console (F12)
# - Publier

# 3. Vérifier dans la console :
# - Requête POST /api/v1/upload → Doit retourner des URLs
# - Requête POST /api/v1/listings → Doit contenir "images": [...]
```

### Vérifier le résultat

```powershell
cd planb-backend

# Compter les images dans la BD
php bin/console doctrine:query:sql "SELECT COUNT(*) FROM images"

# Lister les fichiers uploadés
Get-ChildItem "public\uploads\listings\"
```

---

## 📋 Checklist de diagnostic

- [ ] Backend en cours d'exécution
- [ ] Frontend en cours d'exécution
- [ ] Dossier `public/uploads/listings/` existe
- [ ] Permissions d'écriture OK
- [ ] Console navigateur ouverte (F12)
- [ ] Test avec UNE image simple (JPG < 2MB)
- [ ] Vérifier la requête `/upload` dans l'onglet Network
- [ ] Vérifier la réponse contient `urls`
- [ ] Vérifier que `POST /listings` contient le champ `images`

---

## 🎯 Conclusion

**Problème le plus probable** : L'annonce a été créée **sans sélectionner d'images**.

**Solution immédiate** :
1. Créer une nouvelle annonce
2. **Sélectionner au moins 1 image**
3. Vérifier dans la console que l'upload fonctionne

**Solution à long terme** :
1. Améliorer la gestion des erreurs d'upload
2. Informer l'utilisateur en cas d'échec
3. Optionnellement rendre les images obligatoires

---

## 🚀 Action recommandée

**Testez maintenant** :
1. Ouvrir http://localhost:5173
2. Publier une nouvelle annonce AVEC une image
3. Si l'image s'affiche → Problème résolu (c'était juste que l'annonce n'avait pas d'images)
4. Si l'image ne s'upload pas → Vérifier les logs d'erreur dans la console

**Le code est bon. Le problème est probablement que l'utilisateur n'a pas uploadé d'images lors de la création.**
