# Ajout de l'unité de prix pour les locations

## Modifications effectuées

### Frontend

#### 1. Page de publication (`planb-frontend/src/pages/Publish.jsx`)
- ✅ Ajout du champ `priceUnit` dans le state avec valeur par défaut `'mois'`
- ✅ Ajout d'un menu déroulant Select pour choisir entre `/mois` et `/heure`
- ✅ Le menu déroulant s'affiche uniquement pour les locations
- ✅ Affichage de l'unité dans le récapitulatif avant publication
- ✅ Envoi du `priceUnit` à l'API lors de la création

#### 2. Page d'édition (`planb-frontend/src/pages/EditListing.jsx`)
- ✅ Import du composant `Select`
- ✅ Ajout du champ `priceUnit` dans le state
- ✅ Chargement de la valeur existante lors de l'édition
- ✅ Menu déroulant pour modifier l'unité de prix
- ✅ Sauvegarde de la nouvelle valeur

#### 3. Carte d'annonce (`planb-frontend/src/components/listing/ListingCard.jsx`)
- ✅ Affichage de l'unité de prix (ex: `150 000 FCFA /mois`)
- ✅ Affichage uniquement pour les locations

#### 4. Page de détail (`planb-frontend/src/pages/ListingDetail.jsx`)
- ✅ Affichage de l'unité de prix dans le prix principal
- ✅ Affichage dans le partage (ex: "Villa F4 - 150000 FCFA /mois")

### Backend

#### 1. Entité Listing (`planb-backend/src/Entity/Listing.php`)
- ✅ Ajout du champ `priceUnit` (VARCHAR(10), nullable, défaut: 'mois')
- ✅ Validation avec Assert\Choice(['mois', 'heure'])
- ✅ Ajout des getters et setters

#### 2. Contrôleur Listing (`planb-backend/src/Controller/ListingController.php`)
- ✅ Ajout de `setPriceUnit()` lors de la création d'annonce
- ✅ Ajout de la mise à jour du `priceUnit` lors de l'édition
- ✅ Ajout du champ dans la sérialisation JSON

#### 3. Migration base de données
- ✅ Création de la migration `Version20241118_AddPriceUnitToListings.php`
- ✅ Ajout de la colonne `price_unit` avec valeur par défaut 'mois'

## Instructions de déploiement

### 1. Appliquer la migration base de données

```powershell
# Dans le dossier planb-backend
php bin/console doctrine:migrations:migrate
```

### 2. Vérifier que la colonne a été ajoutée

```sql
-- Dans PostgreSQL
\d listings
-- Ou
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'listings' AND column_name = 'price_unit';
```

### 3. Redémarrer le backend

```powershell
# Arrêter le backend (Ctrl+C)
# Puis redémarrer
php -S localhost:8000 -t public
```

### 4. Tester le frontend

```powershell
# Dans le dossier planb-frontend
npm run dev
```

## Fonctionnement

### Pour l'utilisateur

1. **Lors de la publication d'une annonce de location** :
   - L'utilisateur saisit le prix (ex: 150000)
   - Un menu déroulant apparaît à côté avec les options :
     - `/mois` (sélectionné par défaut)
     - `/heure`
   - L'utilisateur choisit l'unité appropriée

2. **Affichage sur les cartes** :
   - Vente : `25 000 000 FCFA`
   - Location : `150 000 FCFA /mois` ou `5 000 FCFA /heure`

3. **Page de détail** :
   - Le prix s'affiche avec l'unité : `150 000 FCFA /mois`

4. **Modification d'annonce** :
   - L'unité actuelle est pré-sélectionnée
   - L'utilisateur peut la modifier si nécessaire

### Validation

- Le champ `priceUnit` accepte uniquement `'mois'` ou `'heure'`
- Par défaut : `'mois'`
- Le champ est nullable pour compatibilité avec anciennes annonces
- Affichage uniquement si `type === 'location'`

## Résultat

✅ **Menu déroulant pour choisir /mois ou /heure** lors de la publication
✅ **Affichage correct de l'unité** sur toutes les pages
✅ **Modification possible** de l'unité lors de l'édition
✅ **Compatible avec les annonces existantes** (valeur par défaut 'mois')
✅ **Backend et frontend synchronisés**
