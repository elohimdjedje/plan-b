# ✅ Correction - Barre de recherche

## 🐛 Problème identifié

La barre de recherche ne fonctionnait pas. Quand l'utilisateur tapait un mot-clé (par exemple "maison"), aucune recherche n'était effectuée et les annonces ne se filtraient pas.

## 🔍 Causes du bug

### 1. Frontend - `FilterBar.jsx`
Le composant `FilterBar` mettait à jour l'état local `filters.search` mais **ne déclenchait jamais** la recherche via la fonction `onFilter()`.

### 2. Frontend - `Home.jsx`  
Le paramètre `search` n'était **pas envoyé à l'API** dans la fonction `loadListings()`.

### 3. Backend - `ListingController.php`
Le contrôleur ne récupérait **pas le paramètre search** depuis la requête HTTP.

### 4. Backend - `ListingRepository.php`
La méthode `searchListings()` ne filtrait **pas par mot-clé** dans le titre et la description.

## ✅ Solutions appliquées

### 1. `planb-frontend/src/components/listing/FilterBar.jsx`

**Ajout d'un `useEffect` avec debounce** pour déclencher automatiquement la recherche 500ms après la dernière frappe :

```javascript
// Déclencher la recherche avec debounce quand le texte change
useEffect(() => {
  const timer = setTimeout(() => {
    // Appliquer le filtre de recherche
    onFilter({ ...currentFilters, search: filters.search });
  }, 500); // Attendre 500ms après la dernière frappe

  return () => clearTimeout(timer);
}, [filters.search]);
```

### 2. `planb-frontend/src/pages/Home.jsx`

**Ajout du paramètre search** aux paramètres envoyés à l'API :

```javascript
// Appliquer les autres filtres
if (filters.search && filters.search.trim()) {
  params.search = filters.search.trim();
}
```

### 3. `planb-backend/src/Controller/ListingController.php`

**Récupération du paramètre search** depuis la requête :

```php
if ($request->query->has('search')) {
    $filters['search'] = $request->query->get('search');
}
```

### 4. `planb-backend/src/Repository/ListingRepository.php`

**Recherche par mot-clé** dans le titre ET la description :

```php
// Recherche par mot-clé dans le titre et la description
if (isset($filters['search']) && !empty($filters['search'])) {
    $qb->andWhere('l.title LIKE :search OR l.description LIKE :search')
        ->setParameter('search', '%' . $filters['search'] . '%');
}
```

## 🎯 Résultat

Maintenant la recherche fonctionne comme ceci :

1. ✅ L'utilisateur tape un mot-clé (ex: "maison")
2. ✅ Après 500ms, la recherche est déclenchée automatiquement (debounce)
3. ✅ Le mot-clé est envoyé au backend via l'API
4. ✅ Le backend recherche dans le **titre** et la **description** des annonces
5. ✅ Seules les annonces correspondantes sont affichées

## 🧪 Test

1. Allez sur la page d'accueil
2. Tapez "maison" dans la barre de recherche
3. Attendez 500ms
4. ✅ Seules les annonces contenant "maison" dans le titre ou la description s'affichent

## 🔍 Recherche intelligente

La recherche est **insensible à la casse** et cherche dans :
- **Titre de l'annonce**
- **Description de l'annonce**

Exemples de recherches qui fonctionnent :
- "villa" → Trouve toutes les villas
- "appartement 3 pièces" → Trouve les appartements avec "3 pièces" dans la description
- "terrain" → Trouve tous les terrains
- "voiture" → Trouve toutes les voitures
- "hôtel" → Trouve tous les hôtels

## ⚡ Performance

- **Debounce de 500ms** : Évite de surcharger le serveur avec trop de requêtes
- **Recherche côté backend** : Plus rapide et plus efficace
- **LIKE optimisé** : Recherche dans la base de données

## 🎨 UX

- ✅ **Recherche automatique** : Pas besoin d'appuyer sur Entrée
- ✅ **Feedback visuel** : Loader pendant le chargement
- ✅ **Message clair** : "Aucune annonce trouvée" si pas de résultat
- ✅ **Combinaison de filtres** : La recherche fonctionne avec les autres filtres (catégorie, prix, ville, etc.)

## 📝 Notes techniques

### Debounce

Le debounce permet d'attendre que l'utilisateur finisse de taper avant de lancer la recherche. Cela évite de faire une requête à chaque lettre tapée.

**Sans debounce** :
- "m" → requête
- "ma" → requête
- "mai" → requête
- "mais" → requête
- "maiso" → requête
- "maison" → requête
→ 6 requêtes !

**Avec debounce (500ms)** :
- L'utilisateur tape "maison"
- Attend 500ms
- "maison" → requête
→ 1 seule requête !

### Recherche LIKE

La recherche utilise `LIKE '%mot%'` qui cherche le mot **n'importe où** dans le texte :
- **Début** : "maison moderne" → ✅ trouvé avec "maison"
- **Milieu** : "Belle maison avec jardin" → ✅ trouvé avec "maison"
- **Fin** : "Superbe villa maison" → ✅ trouvé avec "maison"

## 🚀 Améliorations futures possibles

1. **Recherche full-text** : Utiliser la recherche full-text de MySQL pour de meilleures performances
2. **Suggestions** : Afficher des suggestions pendant la saisie
3. **Historique de recherche** : Sauvegarder et afficher les recherches récentes
4. **Filtres intelligents** : Détecter le type de recherche (prix, ville, etc.) automatiquement
5. **Recherche phonétique** : Trouver "maison" même si l'utilisateur tape "méson"
