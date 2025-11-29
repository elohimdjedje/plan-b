<?php

namespace App\Controller;

use App\Entity\Listing;
use App\Entity\User;
use App\Entity\Image;
use App\Repository\ListingRepository;
use App\Service\ViewCounterService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/v1/listings')]
class ListingController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ValidatorInterface $validator,
        private ListingRepository $listingRepository,
        private ViewCounterService $viewCounterService
    ) {
    }

    #[Route('', name: 'listings_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $limit = min((int) $request->query->get('limit', 20), 50);
        $lastId = $request->query->get('lastId');

        // Récupérer les filtres depuis la requête
        $filters = [];
        
        if ($request->query->has('search')) {
            $filters['search'] = $request->query->get('search');
        }
        
        if ($request->query->has('category')) {
            $filters['category'] = $request->query->get('category');
        }
        
        if ($request->query->has('subcategory')) {
            $filters['subcategory'] = $request->query->get('subcategory');
        }
        
        if ($request->query->has('type')) {
            $filters['type'] = $request->query->get('type');
        }
        
        if ($request->query->has('city')) {
            $filters['city'] = $request->query->get('city');
        }
        
        if ($request->query->has('minPrice')) {
            $filters['priceMin'] = (float) $request->query->get('minPrice');
        }
        
        if ($request->query->has('maxPrice')) {
            $filters['priceMax'] = (float) $request->query->get('maxPrice');
        }

        // Si des filtres sont présents, utiliser searchListings, sinon findActiveListings
        if (count($filters) > 0) {
            $listings = $this->listingRepository->searchListings($filters, $limit);
        } else {
            $listings = $this->listingRepository->findActiveListings($limit, $lastId);
        }

        return $this->json([
            'data' => array_map(fn($listing) => $this->serializeListing($listing), $listings),
            'hasMore' => count($listings) === $limit,
            'lastId' => count($listings) > 0 ? $listings[count($listings) - 1]->getId() : null
        ]);
    }

    #[Route('/pro', name: 'listings_pro', methods: ['GET'])]
    public function getProListings(Request $request): JsonResponse
    {
        $limit = min((int) $request->query->get('limit', 10), 20);
        
        // Récupérer les annonces des vendeurs PRO
        $proListings = $this->listingRepository->findProListings($limit);
        
        return $this->json([
            'data' => array_map(fn($listing) => $this->serializeListing($listing), $proListings),
            'total' => count($proListings)
        ]);
    }

    #[Route('/{id}', name: 'listings_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $listing = $this->listingRepository->find($id);

        if (!$listing) {
            return $this->json(['error' => 'Annonce non trouvée'], Response::HTTP_NOT_FOUND);
        }

        // Enregistrer une vue unique seulement si ce n'est pas le propriétaire
        $currentUser = $this->getUser();
        $isOwner = $currentUser && $currentUser instanceof User && $currentUser->getId() === $listing->getUser()->getId();
        
        if (!$isOwner) {
            // Utiliser le service de comptage unique
            $this->viewCounterService->recordView($listing, $currentUser instanceof User ? $currentUser : null);
        }

        return $this->json($this->serializeListing($listing, true));
    }

    #[Route('', name: 'listings_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        // Vérifier les limites FREE (4 annonces max)
        if (!$user->isPro()) {
            $userListingsCount = count($user->getListings()->filter(fn($l) => $l->getStatus() === 'active'));
            
            if ($userListingsCount >= 4) {
                return $this->json([
                    'error' => 'QUOTA_EXCEEDED',
                    'message' => 'Vous avez atteint la limite de 4 annonces actives en mode gratuit. Passez PRO pour publier sans limite.',
                    'currentListings' => $userListingsCount,
                    'maxListings' => 4
                ], Response::HTTP_FORBIDDEN);
            }
        }

        // Créer l'annonce
        $listing = new Listing();
        $listing->setUser($user)
            ->setTitle($data['title'])
            ->setDescription($data['description'])
            ->setPrice($data['price'])
            ->setPriceUnit($data['priceUnit'] ?? 'mois')
            ->setCurrency($data['currency'] ?? 'XOF')
            ->setCategory($data['category'])
            ->setSubcategory($data['subcategory'] ?? null)
            ->setType($data['type'] ?? 'vente')
            ->setCountry($data['country'])
            ->setCity($data['city'])
            ->setCommune($data['commune'] ?? null)
            ->setQuartier($data['quartier'] ?? null)
            ->setAddress($data['address'] ?? null)
            ->setSpecifications($data['specifications'] ?? [])
            ->setContactPhone($data['contactPhone'] ?? null)
            ->setContactWhatsapp($data['contactWhatsapp'] ?? null)
            ->setContactEmail($data['contactEmail'] ?? null)
            ->setStatus('active');

        // Définir la durée selon le type de compte (30j FREE / 60j PRO)
        $duration = $user->isPro() ? 60 : 30;
        $listing->setExpiresAt(new \DateTime("+$duration days"));

        // Valider
        $errors = $this->validator->validate($listing);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()][] = $error->getMessage();
            }
            return $this->json([
                'error' => 'Erreur de validation',
                'details' => $errorMessages
            ], Response::HTTP_BAD_REQUEST);
        }

        // Gérer les images si présentes
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

        // Sauvegarder
        try {
            $this->entityManager->persist($listing);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Annonce créée avec succès',
                'data' => $this->serializeListing($listing, true)
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la création',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'listings_update', methods: ['PUT', 'PATCH'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $listing = $this->listingRepository->find($id);

        if (!$listing) {
            return $this->json(['error' => 'Annonce non trouvée'], Response::HTTP_NOT_FOUND);
        }

        if ($listing->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        // Mettre à jour les champs modifiables
        if (isset($data['title'])) {
            $listing->setTitle($data['title']);
        }
        if (isset($data['description'])) {
            $listing->setDescription($data['description']);
        }
        if (isset($data['price'])) {
            $listing->setPrice($data['price']);
        }
        if (isset($data['priceUnit'])) {
            $listing->setPriceUnit($data['priceUnit']);
        }
        if (isset($data['specifications'])) {
            $listing->setSpecifications($data['specifications']);
        }

        $listing->setUpdatedAt(new \DateTime());

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Annonce mise à jour',
            'data' => $this->serializeListing($listing, true)
        ]);
    }

    #[Route('/{id}', name: 'listings_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof User) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $listing = $this->listingRepository->find($id);

        if (!$listing) {
            return $this->json(['error' => 'Annonce non trouvée'], Response::HTTP_NOT_FOUND);
        }

        if ($listing->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $this->entityManager->remove($listing);
        $this->entityManager->flush();

        return $this->json(['message' => 'Annonce supprimée avec succès']);
    }

    /**
     * Incrémenter le compteur de contacts d'une annonce
     */
    #[Route('/{id}/contact', name: 'app_listing_contact', methods: ['POST'])]
    public function incrementContact(int $id): JsonResponse
    {
        $listing = $this->listingRepository->find($id);

        if (!$listing) {
            return $this->json(['error' => 'Annonce non trouvée'], Response::HTTP_NOT_FOUND);
        }

        $listing->incrementContacts();
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Contact enregistré',
            'contactsCount' => $listing->getContactsCount()
        ]);
    }

    private function serializeListing(Listing $listing, bool $detailed = false): array
    {
        // Calculer le score du vendeur (somme des vues + contacts de toutes ses annonces)
        $user = $listing->getUser();
        $sellerScore = 0;
        foreach ($user->getListings() as $userListing) {
            $sellerScore += $userListing->getViewsCount() + $userListing->getContactsCount();
        }

        $data = [
            'id' => $listing->getId(),
            'title' => $listing->getTitle(),
            'description' => $detailed ? $listing->getDescription() : mb_substr($listing->getDescription(), 0, 150, 'UTF-8') . '...',
            'price' => (float) $listing->getPrice(),
            'priceUnit' => $listing->getPriceUnit(),
            'currency' => $listing->getCurrency(),
            'category' => $listing->getCategory(),
            'subcategory' => $listing->getSubcategory(),
            'type' => $listing->getType(),
            'country' => $listing->getCountry(),
            'city' => $listing->getCity(),
            'commune' => $listing->getCommune(),
            'quartier' => $listing->getQuartier(),
            'status' => $listing->getStatus(),
            'isFeatured' => $listing->isFeatured(),
            'viewsCount' => $listing->getViewsCount(),
            'createdAt' => $listing->getCreatedAt()->format('c'),
            'expiresAt' => $listing->getExpiresAt()->format('c'),
            'mainImage' => $listing->getMainImage()?->getUrl(),
            // Toujours inclure les infos user de base pour afficher le badge PRO et le nom
            'user' => [
                'id' => $user->getId(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'accountType' => $user->getAccountType(),
                'isPro' => $user->isPro(),
                'sellerScore' => $sellerScore,
            ],
        ];

        if ($detailed) {
            $data['address'] = $listing->getAddress();
            $data['specifications'] = $listing->getSpecifications();
            $data['contactsCount'] = $listing->getContactsCount();
            $data['images'] = array_map(fn($img) => [
                'url' => $img->getUrl(),
                'thumbnailUrl' => $img->getThumbnailUrl(),
            ], $listing->getImages()->toArray());
            // Ajouter les infos de contact spécifiques à l'annonce
            $data['contactPhone'] = $listing->getContactPhone();
            $data['contactWhatsapp'] = $listing->getContactWhatsapp();
            $data['contactEmail'] = $listing->getContactEmail();
            // Ajouter les infos détaillées de l'user
            $data['user']['id'] = $listing->getUser()->getId();
            $data['user']['firstName'] = $listing->getUser()->getFirstName();
            $data['user']['lastName'] = $listing->getUser()->getLastName();
            $data['user']['phone'] = $listing->getUser()->getPhone();
            $data['user']['whatsappPhone'] = $listing->getUser()->getWhatsappPhone();
            $data['user']['city'] = $listing->getUser()->getCity();
        }

        return $data;
    }
}
