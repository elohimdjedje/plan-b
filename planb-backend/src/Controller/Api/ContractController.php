<?php

namespace App\Controller\Api;

use App\Entity\Booking;
use App\Repository\BookingRepository;
use App\Repository\ContractRepository;
use App\Service\ContractService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/contracts')]
class ContractController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private BookingRepository $bookingRepository,
        private ContractRepository $contractRepository,
        private ContractService $contractService
    ) {
    }

    /**
     * Génère un contrat pour une réservation
     * POST /api/v1/contracts/generate
     */
    #[Route('/generate', name: 'api_contracts_generate', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function generate(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['booking_id'])) {
            return $this->json(['error' => 'booking_id est requis'], Response::HTTP_BAD_REQUEST);
        }

        $booking = $this->bookingRepository->find($data['booking_id']);
        if (!$booking) {
            return $this->json(['error' => 'Réservation introuvable'], Response::HTTP_NOT_FOUND);
        }

        $user = $this->getUser();
        // Vérifier les permissions
        if ($booking->getOwner()->getId() !== $user->getId() && 
            ($booking->getTenant() && $booking->getTenant()->getId() !== $user->getId())) {
            return $this->json(['error' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }

        try {
            $templateType = $data['template_type'] ?? 'furnished_rental';
            $contract = $this->contractService->generateContract($booking, $templateType);

            return $this->json([
                'success' => true,
                'message' => 'Contrat généré avec succès',
                'data' => $this->serializeContract($contract)
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Récupère le contrat d'une réservation
     * GET /api/v1/contracts/booking/{id}
     */
    #[Route('/booking/{id}', name: 'api_contracts_get', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function get(int $id): JsonResponse
    {
        $booking = $this->bookingRepository->find($id);
        if (!$booking) {
            return $this->json(['error' => 'Réservation introuvable'], Response::HTTP_NOT_FOUND);
        }

        $user = $this->getUser();
        // Vérifier les permissions
        if ($booking->getOwner()->getId() !== $user->getId() && 
            ($booking->getTenant() && $booking->getTenant()->getId() !== $user->getId())) {
            return $this->json(['error' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }

        $contract = $this->contractRepository->findOneBy(['booking' => $booking]);
        if (!$contract) {
            return $this->json(['error' => 'Contrat introuvable'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'success' => true,
            'data' => $this->serializeContract($contract)
        ]);
    }

    /**
     * Signe le contrat (propriétaire)
     * POST /api/v1/contracts/{id}/sign-owner
     */
    #[Route('/{id}/sign-owner', name: 'api_contracts_sign_owner', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function signOwner(int $id, Request $request): JsonResponse
    {
        $contract = $this->contractRepository->find($id);
        if (!$contract) {
            return $this->json(['error' => 'Contrat introuvable'], Response::HTTP_NOT_FOUND);
        }

        $user = $this->getUser();
        $booking = $contract->getBooking();
        
        if ($booking->getOwner()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Seul le propriétaire peut signer'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['signature_url'])) {
            return $this->json(['error' => 'signature_url est requis'], Response::HTTP_BAD_REQUEST);
        }

        $this->contractService->signByOwner($contract, $data['signature_url']);

        return $this->json([
            'success' => true,
            'message' => 'Contrat signé par le propriétaire',
            'data' => $this->serializeContract($contract)
        ]);
    }

    /**
     * Signe le contrat (locataire)
     * POST /api/v1/contracts/{id}/sign-tenant
     */
    #[Route('/{id}/sign-tenant', name: 'api_contracts_sign_tenant', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function signTenant(int $id, Request $request): JsonResponse
    {
        $contract = $this->contractRepository->find($id);
        if (!$contract) {
            return $this->json(['error' => 'Contrat introuvable'], Response::HTTP_NOT_FOUND);
        }

        $user = $this->getUser();
        $booking = $contract->getBooking();
        
        if ($booking->getTenant() && $booking->getTenant()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Seul le locataire peut signer'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['signature_url'])) {
            return $this->json(['error' => 'signature_url est requis'], Response::HTTP_BAD_REQUEST);
        }

        $this->contractService->signByTenant($contract, $data['signature_url']);

        return $this->json([
            'success' => true,
            'message' => 'Contrat signé par le locataire',
            'data' => $this->serializeContract($contract)
        ]);
    }

    /**
     * Sérialise un contrat
     */
    private function serializeContract($contract): array
    {
        return [
            'id' => $contract->getId(),
            'booking_id' => $contract->getBooking()->getId(),
            'template_type' => $contract->getTemplateType(),
            'status' => $contract->getStatus(),
            'pdf_url' => $contract->getPdfUrl(),
            'owner_signed_at' => $contract->getOwnerSignedAt()?->format('Y-m-d H:i:s'),
            'tenant_signed_at' => $contract->getTenantSignedAt()?->format('Y-m-d H:i:s'),
            'is_fully_signed' => $contract->isFullySigned(),
            'contract_data' => $contract->getContractData(),
            'created_at' => $contract->getCreatedAt()->format('Y-m-d H:i:s')
        ];
    }
}
