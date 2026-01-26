# 🏠 Visite Virtuelle - Plan d'Implémentation Technique

## 📋 Vue d'ensemble

Ce document contient le code complet pour implémenter la visite virtuelle 360° dans Plan B.

**Durée estimée:** 2-3 jours  
**Complexité:** Moyenne  
**Priorité:** Haute (différenciation concurrentielle)

---

## 🗄️ Étape 1: Base de Données

### Migration SQL

**Fichier:** `planb-backend/migrations/VersionYYYYMMDDHHMMSS_AddVirtualTourToListings.php`

```php
<?php

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20241201000000_AddVirtualTourToListings extends AbstractMigration
{
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE listings ADD COLUMN virtual_tour_type VARCHAR(20) DEFAULT NULL');
        $this->addSql('ALTER TABLE listings ADD COLUMN virtual_tour_url TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE listings ADD COLUMN virtual_tour_thumbnail TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE listings ADD COLUMN virtual_tour_data JSON DEFAULT NULL');
        $this->addSql('CREATE INDEX idx_listing_virtual_tour ON listings(virtual_tour_type)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE listings DROP COLUMN virtual_tour_type');
        $this->addSql('ALTER TABLE listings DROP COLUMN virtual_tour_url');
        $this->addSql('ALTER TABLE listings DROP COLUMN virtual_tour_thumbnail');
        $this->addSql('ALTER TABLE listings DROP COLUMN virtual_tour_data');
    }
}
```

**Ou SQL direct (PostgreSQL):**

```sql
ALTER TABLE listings 
ADD COLUMN virtual_tour_type VARCHAR(20) DEFAULT NULL,
ADD COLUMN virtual_tour_url TEXT DEFAULT NULL,
ADD COLUMN virtual_tour_thumbnail TEXT DEFAULT NULL,
ADD COLUMN virtual_tour_data JSONB DEFAULT NULL;

CREATE INDEX idx_listing_virtual_tour ON listings(virtual_tour_type) 
WHERE virtual_tour_type IS NOT NULL;
```

---

## 🔧 Étape 2: Backend - Entité Listing

**Fichier:** `planb-backend/src/Entity/Listing.php`

Ajouter ces propriétés à la classe `Listing`:

```php
#[ORM\Column(type: 'string', length: 20, nullable: true)]
private ?string $virtualTourType = null; // '360_photo', '360_video', 'matterport'

#[ORM\Column(type: 'text', nullable: true)]
private ?string $virtualTourUrl = null;

#[ORM\Column(type: 'text', nullable: true)]
private ?string $virtualTourThumbnail = null;

#[ORM\Column(type: 'json', nullable: true)]
private ?array $virtualTourData = null; // Métadonnées (hotspots, annotations, etc.)

// Getters et Setters
public function getVirtualTourType(): ?string
{
    return $this->virtualTourType;
}

public function setVirtualTourType(?string $virtualTourType): self
{
    $this->virtualTourType = $virtualTourType;
    return $this;
}

public function getVirtualTourUrl(): ?string
{
    return $this->virtualTourUrl;
}

public function setVirtualTourUrl(?string $virtualTourUrl): self
{
    $this->virtualTourUrl = $virtualTourUrl;
    return $this;
}

public function getVirtualTourThumbnail(): ?string
{
    return $this->virtualTourThumbnail;
}

public function setVirtualTourThumbnail(?string $virtualTourThumbnail): self
{
    $this->virtualTourThumbnail = $virtualTourThumbnail;
    return $this;
}

public function getVirtualTourData(): ?array
{
    return $this->virtualTourData;
}

public function setVirtualTourData(?array $virtualTourData): self
{
    $this->virtualTourData = $virtualTourData;
    return $this;
}

public function hasVirtualTour(): bool
{
    return $this->virtualTourType !== null && $this->virtualTourUrl !== null;
}
```

---

## 📤 Étape 3: Backend - Controller

**Fichier:** `planb-backend/src/Controller/Api/VirtualTourController.php`

```php
<?php

namespace App\Controller\Api;

use App\Entity\Listing;
use App\Repository\ListingRepository;
use App\Service\ImageUploadService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/listings')]
class VirtualTourController extends AbstractController
{
    public function __construct(
        private ListingRepository $listingRepository,
        private EntityManagerInterface $entityManager,
        private ImageUploadService $imageUploadService
    ) {}

    /**
     * Upload une visite virtuelle 360°
     * 
     * POST /api/v1/listings/{id}/virtual-tour
     */
    #[Route('/{id}/virtual-tour', name: 'app_listing_virtual_tour_upload', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function uploadVirtualTour(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        $listing = $this->listingRepository->find($id);

        if (!$listing) {
            return $this->json(['error' => 'Annonce introuvable'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que l'utilisateur est propriétaire
        if ($listing->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }

        // Vérifier que c'est un compte PRO (ou payer)
        if ($user->getAccountType() !== 'PRO' && !$user->isLifetimePro()) {
            return $this->json([
                'error' => 'Visite virtuelle disponible uniquement pour les comptes PRO',
                'upgrade_required' => true
            ], Response::HTTP_FORBIDDEN);
        }

        // Récupérer le fichier
        $file = $request->files->get('virtual_tour');
        
        if (!$file) {
            return $this->json(['error' => 'Fichier manquant'], Response::HTTP_BAD_REQUEST);
        }

        // Valider le type de fichier
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!in_array($file->getMimeType(), $allowedTypes)) {
            return $this->json([
                'error' => 'Format non supporté. Utilisez JPG ou PNG (format équirectangulaire)'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Valider la taille (max 15 MB)
        if ($file->getSize() > 15 * 1024 * 1024) {
            return $this->json([
                'error' => 'Fichier trop volumineux. Maximum 15 MB'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Upload l'image
            $uploadResult = $this->imageUploadService->uploadImage(
                $file,
                'virtual-tours'
            );

            // Générer une miniature
            $thumbnailResult = $this->imageUploadService->generateThumbnail(
                $uploadResult['url'],
                'virtual-tours/thumbnails',
                800, 400
            );

            // Sauvegarder dans la base
            $listing->setVirtualTourType('360_photo');
            $listing->setVirtualTourUrl($uploadResult['url']);
            $listing->setVirtualTourThumbnail($thumbnailResult['url'] ?? $uploadResult['url']);
            $listing->setVirtualTourData([
                'uploaded_at' => (new \DateTime())->format('c'),
                'file_size' => $file->getSize(),
                'dimensions' => [
                    'width' => $uploadResult['width'] ?? null,
                    'height' => $uploadResult['height'] ?? null
                ]
            ]);

            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => 'Visite virtuelle ajoutée avec succès',
                'data' => [
                    'type' => $listing->getVirtualTourType(),
                    'url' => $listing->getVirtualTourUrl(),
                    'thumbnail' => $listing->getVirtualTourThumbnail()
                ]
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de l\'upload',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Récupérer la visite virtuelle d'une annonce
     * 
     * GET /api/v1/listings/{id}/virtual-tour
     */
    #[Route('/{id}/virtual-tour', name: 'app_listing_virtual_tour_get', methods: ['GET'])]
    public function getVirtualTour(int $id): JsonResponse
    {
        $listing = $this->listingRepository->find($id);

        if (!$listing || !$listing->hasVirtualTour()) {
            return $this->json(['error' => 'Visite virtuelle non disponible'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'type' => $listing->getVirtualTourType(),
            'url' => $listing->getVirtualTourUrl(),
            'thumbnail' => $listing->getVirtualTourThumbnail(),
            'data' => $listing->getVirtualTourData()
        ]);
    }

    /**
     * Supprimer la visite virtuelle
     * 
     * DELETE /api/v1/listings/{id}/virtual-tour
     */
    #[Route('/{id}/virtual-tour', name: 'app_listing_virtual_tour_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function deleteVirtualTour(int $id): JsonResponse
    {
        $user = $this->getUser();
        $listing = $this->listingRepository->find($id);

        if (!$listing) {
            return $this->json(['error' => 'Annonce introuvable'], Response::HTTP_NOT_FOUND);
        }

        if ($listing->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }

        // Supprimer le fichier
        if ($listing->getVirtualTourUrl()) {
            try {
                $this->imageUploadService->deleteImage($listing->getVirtualTourUrl());
            } catch (\Exception $e) {
                // Log l'erreur mais continue
            }
        }

        // Supprimer de la base
        $listing->setVirtualTourType(null);
        $listing->setVirtualTourUrl(null);
        $listing->setVirtualTourThumbnail(null);
        $listing->setVirtualTourData(null);

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Visite virtuelle supprimée'
        ]);
    }
}
```

---

## 🎨 Étape 4: Frontend - Installation

**Fichier:** `planb-frontend/package.json`

```bash
npm install photo-sphere-viewer
```

**Ou avec yarn:**

```bash
yarn add photo-sphere-viewer
```

---

## 🧩 Étape 5: Frontend - Composant VirtualTour

**Fichier:** `planb-frontend/src/components/listing/VirtualTour.jsx`

```jsx
import { useEffect, useRef, useState } from 'react';
import { Viewer } from 'photo-sphere-viewer';
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css';
import { X, ZoomIn, ZoomOut, RotateCw, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Composant de visite virtuelle 360°
 */
export default function VirtualTour({ 
  isOpen, 
  onClose, 
  imageUrl,
  thumbnailUrl 
}) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isOpen || !containerRef.current || !imageUrl) return;

    // Créer le viewer
    const viewer = new Viewer({
      container: containerRef.current,
      panorama: imageUrl,
      caption: 'Visite virtuelle 360°',
      navbar: [
        'zoom',
        'move',
        'download',
        'caption',
        'fullscreen'
      ],
      defaultZoomLvl: 30,
      minFov: 30,
      maxFov: 90,
      sphereCorrection: { pan: 0, tilt: 0, roll: 0 },
    });

    viewerRef.current = viewer;

    // Gestion du plein écran
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Nettoyage
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (viewer) {
        viewer.destroy();
      }
    };
  }, [isOpen, imageUrl]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        {/* Conteneur du viewer */}
        <div 
          ref={containerRef} 
          className="w-full h-full"
          style={{ position: 'relative' }}
        />

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full transition-all text-white"
          aria-label="Fermer"
        >
          <X size={24} />
        </button>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg text-white text-sm">
          <p>🖱️ Cliquez et glissez pour explorer • 🔍 Molette pour zoomer</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## 🔗 Étape 6: Frontend - API Client

**Fichier:** `planb-frontend/src/api/virtualTour.js`

```javascript
import api from './axios';

export const virtualTourAPI = {
  /**
   * Upload une visite virtuelle
   */
  upload: async (listingId, file) => {
    const formData = new FormData();
    formData.append('virtual_tour', file);

    const response = await api.post(
      `/listings/${listingId}/virtual-tour`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /**
   * Récupérer la visite virtuelle d'une annonce
   */
  get: async (listingId) => {
    const response = await api.get(`/listings/${listingId}/virtual-tour`);
    return response.data;
  },

  /**
   * Supprimer la visite virtuelle
   */
  delete: async (listingId) => {
    const response = await api.delete(`/listings/${listingId}/virtual-tour`);
    return response.data;
  },
};
```

---

## 📄 Étape 7: Frontend - Intégration dans ListingDetail

**Fichier:** `planb-frontend/src/pages/ListingDetail.jsx`

Ajouter ces imports:

```jsx
import VirtualTour from '../components/listing/VirtualTour';
import { virtualTourAPI } from '../api/virtualTour';
import { Globe } from 'lucide-react';
```

Ajouter dans le state:

```jsx
const [showVirtualTour, setShowVirtualTour] = useState(false);
const [virtualTourData, setVirtualTourData] = useState(null);
```

Ajouter dans useEffect pour charger la visite virtuelle:

```jsx
useEffect(() => {
  // ... code existant ...
  
  // Charger la visite virtuelle si disponible
  if (listing?.id) {
    virtualTourAPI.get(listing.id)
      .then(data => {
        if (data.url) {
          setVirtualTourData(data);
        }
      })
      .catch(() => {
        // Pas de visite virtuelle ou erreur
      });
  }
}, [listing]);
```

Ajouter le bouton dans l'interface:

```jsx
{/* Bouton Visite Virtuelle */}
{virtualTourData && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-4"
  >
    <Button
      variant="primary"
      onClick={() => setShowVirtualTour(true)}
      className="w-full flex items-center justify-center gap-2 py-4 text-lg"
    >
      <Globe size={24} />
      Visite Virtuelle 360°
    </Button>
  </motion.div>
)}
```

Ajouter le modal:

```jsx
{/* Modal Visite Virtuelle */}
{virtualTourData && (
  <VirtualTour
    isOpen={showVirtualTour}
    onClose={() => setShowVirtualTour(false)}
    imageUrl={virtualTourData.url}
    thumbnailUrl={virtualTourData.thumbnail}
  />
)}
```

---

## 🏷️ Étape 8: Frontend - Badge sur les cartes

**Fichier:** `planb-frontend/src/components/listing/ListingCard.jsx`

Ajouter le badge:

```jsx
import { Globe } from 'lucide-react';

// Dans le composant, après les autres badges
{listing.virtualTourType && (
  <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 z-10">
    <Globe size={12} />
    <span className="hidden sm:inline">360°</span>
  </div>
)}
```

---

## 📤 Étape 9: Frontend - Upload dans le formulaire

**Fichier:** `planb-frontend/src/pages/Publish.jsx`

Ajouter une étape pour la visite virtuelle (optionnelle):

```jsx
// Dans le state
const [virtualTourFile, setVirtualTourFile] = useState(null);
const [virtualTourPreview, setVirtualTourPreview] = useState(null);

// Fonction pour sélectionner le fichier
const handleVirtualTourSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Vérifier le format
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (15 MB max)
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 15 MB)');
      return;
    }

    setVirtualTourFile(file);
    
    // Prévisualisation
    const reader = new FileReader();
    reader.onload = (e) => {
      setVirtualTourPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }
};

// Dans le formulaire, ajouter une section (après les photos)
{currentUser?.accountType === 'PRO' && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold flex items-center gap-2">
      <Globe size={20} />
      Visite Virtuelle 360° (Optionnel)
    </h3>
    
    <div className="border-2 border-dashed border-secondary-300 rounded-xl p-6 text-center">
      {virtualTourPreview ? (
        <div className="space-y-4">
          <img 
            src={virtualTourPreview} 
            alt="Preview visite virtuelle"
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setVirtualTourFile(null);
                setVirtualTourPreview(null);
              }}
            >
              Supprimer
            </Button>
            <label className="flex-1">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleVirtualTourSelect}
                className="hidden"
              />
              <Button variant="primary" className="w-full">
                Changer
              </Button>
            </label>
          </div>
        </div>
      ) : (
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleVirtualTourSelect}
            className="hidden"
          />
          <div className="space-y-2">
            <Globe size={48} className="mx-auto text-secondary-400" />
            <p className="text-sm text-secondary-600">
              Cliquez pour ajouter une photo 360°
            </p>
            <p className="text-xs text-secondary-400">
              Format équirectangulaire • Max 15 MB
            </p>
          </div>
        </label>
      )}
    </div>
  </div>
)}

// Dans la fonction de soumission, après la création de l'annonce
if (virtualTourFile && listingId) {
  try {
    await virtualTourAPI.upload(listingId, virtualTourFile);
    toast.success('Visite virtuelle ajoutée !');
  } catch (error) {
    console.error('Erreur upload visite virtuelle:', error);
    toast.error('Erreur lors de l\'upload de la visite virtuelle');
  }
}
```

---

## ✅ Checklist de Test

### Backend
- [ ] Migration base de données appliquée
- [ ] Endpoint upload fonctionne
- [ ] Endpoint GET fonctionne
- [ ] Endpoint DELETE fonctionne
- [ ] Vérification PRO uniquement
- [ ] Validation format/taille fichier
- [ ] Upload vers Cloudinary/local

### Frontend
- [ ] Composant VirtualTour s'affiche
- [ ] Navigation 360° fonctionne
- [ ] Zoom fonctionne
- [ ] Plein écran fonctionne
- [ ] Badge sur cartes d'annonces
- [ ] Bouton dans ListingDetail
- [ ] Upload dans formulaire publication
- [ ] Responsive mobile

### UX
- [ ] Instructions claires
- [ ] Messages d'erreur compréhensibles
- [ ] Loading states
- [ ] Animations fluides

---

## 🚀 Déploiement

1. **Backend:**
   ```bash
   cd planb-backend
   php bin/console doctrine:migrations:migrate
   ```

2. **Frontend:**
   ```bash
   cd planb-frontend
   npm install photo-sphere-viewer
   npm run build
   ```

3. **Tester:**
   - Créer une annonce PRO
   - Upload une photo 360°
   - Vérifier l'affichage
   - Tester sur mobile

---

## 📝 Notes

- **Format équirectangulaire:** Les photos 360° doivent être au format équirectangulaire (ratio 2:1)
- **Taille recommandée:** 4096x2048 pixels ou 8192x4096 pixels
- **Apps pour créer:** Google Street View, Cardboard Camera, 360 Panorama
- **Performance:** Optimiser les images avant upload (compression)

---

**🎉 Félicitations ! La visite virtuelle est maintenant implémentée !**


