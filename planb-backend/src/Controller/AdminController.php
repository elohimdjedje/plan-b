<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Repository\ListingRepository;
use App\Repository\PaymentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin')]
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository,
        private ListingRepository $listingRepository,
        private PaymentRepository $paymentRepository
    ) {}

    /**
     * Dashboard admin - Statistiques globales
     */
    #[Route('/dashboard', name: 'app_admin_dashboard', methods: ['GET'])]
    public function dashboard(): JsonResponse
    {
        // Statistiques utilisateurs
        $totalUsers = $this->userRepository->count([]);
        $freeUsers = $this->userRepository->count(['accountType' => 'FREE']);
        $proUsers = $this->userRepository->count(['accountType' => 'PRO']);

        // Statistiques annonces
        $totalListings = $this->listingRepository->count([]);
        $activeListings = $this->listingRepository->count(['status' => 'active']);
        $draftListings = $this->listingRepository->count(['status' => 'draft']);
        $expiredListings = $this->listingRepository->count(['status' => 'expired']);

        // Statistiques paiements
        $totalPayments = $this->paymentRepository->count([]);
        $completedPayments = $this->paymentRepository->count(['status' => 'completed']);
        $pendingPayments = $this->paymentRepository->count(['status' => 'pending']);

        // Revenus totaux
        $qb = $this->entityManager->createQueryBuilder();
        $totalRevenue = $qb->select('SUM(p.amount)')
            ->from('App\Entity\Payment', 'p')
            ->where('p.status = :completed')
            ->andWhere('p.currency = :xof')
            ->setParameter('completed', 'completed')
            ->setParameter('xof', 'XOF')
            ->getQuery()
            ->getSingleScalarResult();

        // Nouveaux utilisateurs ce mois
        $startOfMonth = new \DateTimeImmutable('first day of this month 00:00:00');
        $newUsersThisMonth = $this->userRepository->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->where('u.createdAt >= :start')
            ->setParameter('start', $startOfMonth)
            ->getQuery()
            ->getSingleScalarResult();

        // Nouvelles annonces ce mois
        $newListingsThisMonth = $this->listingRepository->createQueryBuilder('l')
            ->select('COUNT(l.id)')
            ->where('l.createdAt >= :start')
            ->setParameter('start', $startOfMonth)
            ->getQuery()
            ->getSingleScalarResult();

        return $this->json([
            'dashboard' => [
                'users' => [
                    'total' => $totalUsers,
                    'free' => $freeUsers,
                    'pro' => $proUsers,
                    'newThisMonth' => (int) $newUsersThisMonth
                ],
                'listings' => [
                    'total' => $totalListings,
                    'active' => $activeListings,
                    'draft' => $draftListings,
                    'expired' => $expiredListings,
                    'newThisMonth' => (int) $newListingsThisMonth
                ],
                'payments' => [
                    'total' => $totalPayments,
                    'completed' => $completedPayments,
                    'pending' => $pendingPayments
                ],
                'revenue' => [
                    'total' => (float) ($totalRevenue ?? 0),
                    'currency' => 'XOF'
                ]
            ]
        ]);
    }

    /**
     * Liste tous les utilisateurs
     */
    #[Route('/users', name: 'app_admin_users', methods: ['GET'])]
    public function getUsers(Request $request): JsonResponse
    {
        $limit = min($request->query->get('limit', 50), 100);
        $offset = $request->query->get('offset', 0);
        $accountType = $request->query->get('accountType'); // FREE, PRO
        $search = $request->query->get('search'); // email, phone

        $qb = $this->userRepository->createQueryBuilder('u')
            ->setMaxResults($limit)
            ->setFirstResult($offset)
            ->orderBy('u.createdAt', 'DESC');

        if ($accountType) {
            $qb->andWhere('u.accountType = :type')
                ->setParameter('type', $accountType);
        }

        if ($search) {
            $qb->andWhere('u.email LIKE :search OR u.phone LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        $users = $qb->getQuery()->getResult();

        // Compter le total
        $countQb = clone $qb;
        $countQb->select('COUNT(u.id)');
        $countQb->resetDQLPart('orderBy');
        $countQb->setFirstResult(0)->setMaxResults(null);
        $total = $countQb->getQuery()->getSingleScalarResult();

        $data = array_map(function($user) {
            return [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'phone' => $user->getPhone(),
                'fullName' => $user->getFullName(),
                'accountType' => $user->getAccountType(),
                'isLifetimePro' => $user->isLifetimePro(),
                'country' => $user->getCountry(),
                'city' => $user->getCity(),
                'subscriptionExpiresAt' => $user->getSubscriptionExpiresAt()?->format('c'),
                'createdAt' => $user->getCreatedAt()->format('c'),
                'totalListings' => $user->getListings()->count(),
                'totalPayments' => $user->getPayments()->count()
            ];
        }, $users);

        return $this->json([
            'users' => $data,
            'total' => (int) $total,
            'limit' => $limit,
            'offset' => $offset
        ]);
    }

    /**
     * Détail d'un utilisateur
     */
    #[Route('/users/{id}', name: 'app_admin_user_detail', methods: ['GET'])]
    public function getUserDetail(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);

        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Statistiques de l'utilisateur
        $listings = $user->getListings();
        $payments = $user->getPayments();

        $totalRevenue = 0;
        foreach ($payments as $payment) {
            if ($payment->getStatus() === 'completed') {
                $totalRevenue += $payment->getAmount();
            }
        }

        return $this->json([
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'phone' => $user->getPhone(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'fullName' => $user->getFullName(),
                'accountType' => $user->getAccountType(),
                'isLifetimePro' => $user->isLifetimePro(),
                'country' => $user->getCountry(),
                'city' => $user->getCity(),
                'profilePicture' => $user->getProfilePicture(),
                'isEmailVerified' => $user->isEmailVerified(),
                'isPhoneVerified' => $user->isPhoneVerified(),
                'subscriptionExpiresAt' => $user->getSubscriptionExpiresAt()?->format('c'),
                'createdAt' => $user->getCreatedAt()->format('c'),
                'updatedAt' => $user->getUpdatedAt()?->format('c')
            ],
            'stats' => [
                'totalListings' => $listings->count(),
                'activeListings' => $listings->filter(fn($l) => $l->getStatus() === 'active')->count(),
                'totalPayments' => $payments->count(),
                'completedPayments' => $payments->filter(fn($p) => $p->getStatus() === 'completed')->count(),
                'totalRevenue' => $totalRevenue,
                'currency' => 'XOF'
            ]
        ]);
    }

    /**
     * Mettre un utilisateur en PRO illimité
     */
    #[Route('/users/{id}/lifetime-pro', name: 'app_admin_lifetime_pro', methods: ['PUT'])]
    public function setLifetimePro(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);

        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        $user->setAccountType('PRO');
        $user->setIsLifetimePro(true);
        $user->setSubscriptionExpiresAt(null);
        $user->setUpdatedAt(new \DateTime());

        $this->entityManager->flush();

        return $this->json([
            'message' => 'Utilisateur mis en PRO illimité',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'accountType' => 'PRO',
                'isLifetimePro' => true,
                'subscriptionExpiresAt' => null
            ]
        ]);
    }

    /**
     * Retirer le PRO illimité
     */
    #[Route('/users/{id}/remove-lifetime-pro', name: 'app_admin_remove_lifetime_pro', methods: ['PUT'])]
    public function removeLifetimePro(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);

        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        $user->setIsLifetimePro(false);
        $user->setAccountType('FREE');
        $user->setSubscriptionExpiresAt(null);
        $user->setUpdatedAt(new \DateTime());

        $this->entityManager->flush();

        return $this->json([
            'message' => 'PRO illimité retiré',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'accountType' => 'FREE',
                'isLifetimePro' => false
            ]
        ]);
    }

    /**
     * Liste toutes les annonces (avec filtres)
     */
    #[Route('/listings', name: 'app_admin_listings', methods: ['GET'])]
    public function getListings(Request $request): JsonResponse
    {
        $limit = min($request->query->get('limit', 50), 100);
        $offset = $request->query->get('offset', 0);
        $status = $request->query->get('status');
        $category = $request->query->get('category');

        $qb = $this->listingRepository->createQueryBuilder('l')
            ->setMaxResults($limit)
            ->setFirstResult($offset)
            ->orderBy('l.createdAt', 'DESC');

        if ($status) {
            $qb->andWhere('l.status = :status')
                ->setParameter('status', $status);
        }

        if ($category) {
            $qb->andWhere('l.category = :category')
                ->setParameter('category', $category);
        }

        $listings = $qb->getQuery()->getResult();

        // Compter le total
        $countQb = clone $qb;
        $countQb->select('COUNT(l.id)');
        $countQb->resetDQLPart('orderBy');
        $countQb->setFirstResult(0)->setMaxResults(null);
        $total = $countQb->getQuery()->getSingleScalarResult();

        $data = array_map(function($listing) {
            return [
                'id' => $listing->getId(),
                'title' => $listing->getTitle(),
                'price' => $listing->getPrice(),
                'currency' => $listing->getCurrency(),
                'category' => $listing->getCategory(),
                'type' => $listing->getType(),
                'status' => $listing->getStatus(),
                'city' => $listing->getCity(),
                'country' => $listing->getCountry(),
                'isFeatured' => $listing->isIsFeatured(),
                'viewsCount' => $listing->getViewsCount(),
                'contactsCount' => $listing->getContactsCount(),
                'createdAt' => $listing->getCreatedAt()->format('c'),
                'expiresAt' => $listing->getExpiresAt()->format('c'),
                'user' => [
                    'id' => $listing->getUser()->getId(),
                    'email' => $listing->getUser()->getEmail(),
                    'accountType' => $listing->getUser()->getAccountType()
                ]
            ];
        }, $listings);

        return $this->json([
            'listings' => $data,
            'total' => (int) $total,
            'limit' => $limit,
            'offset' => $offset
        ]);
    }

    /**
     * Supprimer une annonce (modération)
     */
    #[Route('/listings/{id}', name: 'app_admin_delete_listing', methods: ['DELETE'])]
    public function deleteListing(int $id): JsonResponse
    {
        $listing = $this->listingRepository->find($id);

        if (!$listing) {
            return $this->json(['error' => 'Annonce non trouvée'], 404);
        }

        $this->entityManager->remove($listing);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Annonce supprimée avec succès'
        ]);
    }

    /**
     * Revenus totaux
     */
    #[Route('/revenues', name: 'app_admin_revenues', methods: ['GET'])]
    public function getRevenues(): JsonResponse
    {
        // Revenus totaux
        $qb = $this->entityManager->createQueryBuilder();
        $totalRevenue = $qb->select('SUM(p.amount)')
            ->from('App\Entity\Payment', 'p')
            ->where('p.status = :completed')
            ->andWhere('p.currency = :xof')
            ->setParameter('completed', 'completed')
            ->setParameter('xof', 'XOF')
            ->getQuery()
            ->getSingleScalarResult();

        // Revenus par type (PostgreSQL syntax)
        $conn = $this->entityManager->getConnection();
        $sql = "SELECT 
                    p.metadata->>'type' as type,
                    SUM(p.amount) as amount,
                    COUNT(p.id) as count
                FROM payments p
                WHERE p.status = :completed
                GROUP BY p.metadata->>'type'";
        
        $stmt = $conn->prepare($sql);
        $result = $stmt->executeQuery(['completed' => 'completed']);
        $revenuesByType = $result->fetchAllAssociative();

        return $this->json([
            'revenues' => [
                'total' => (float) ($totalRevenue ?? 0),
                'currency' => 'XOF',
                'byType' => $revenuesByType
            ]
        ]);
    }

    /**
     * Revenus par mois
     */
    #[Route('/revenues/monthly', name: 'app_admin_revenues_monthly', methods: ['GET'])]
    public function getRevenuesMonthly(): JsonResponse
    {
        // Revenus des 12 derniers mois (PostgreSQL syntax)
        $conn = $this->entityManager->getConnection();
        $sql = "SELECT 
                    TO_CHAR(p.created_at, 'YYYY-MM') as month,
                    SUM(p.amount) as amount,
                    COUNT(p.id) as count
                FROM payments p
                WHERE p.status = :completed
                AND p.created_at >= :twelveMonthsAgo
                GROUP BY TO_CHAR(p.created_at, 'YYYY-MM')
                ORDER BY month ASC";
        
        $stmt = $conn->prepare($sql);
        $twelveMonthsAgo = (new \DateTimeImmutable('-12 months'))->format('Y-m-d H:i:s');
        $result = $stmt->executeQuery([
            'completed' => 'completed',
            'twelveMonthsAgo' => $twelveMonthsAgo
        ]);
        $results = $result->fetchAllAssociative();

        return $this->json([
            'revenues' => [
                'monthly' => $results,
                'currency' => 'XOF'
            ]
        ]);
    }

    /**
     * Statistiques de croissance
     */
    #[Route('/stats/growth', name: 'app_admin_stats_growth', methods: ['GET'])]
    public function getGrowthStats(): JsonResponse
    {
        // Nouveaux utilisateurs par jour (30 derniers jours) - PostgreSQL
        $conn = $this->entityManager->getConnection();
        $thirtyDaysAgo = (new \DateTimeImmutable('-30 days'))->format('Y-m-d H:i:s');
        
        $sqlUsers = "SELECT 
                        CAST(u.created_at AS DATE) as date,
                        COUNT(u.id) as count
                    FROM users u
                    WHERE u.created_at >= :thirtyDaysAgo
                    GROUP BY CAST(u.created_at AS DATE)
                    ORDER BY date ASC";
        
        $stmt = $conn->prepare($sqlUsers);
        $result = $stmt->executeQuery(['thirtyDaysAgo' => $thirtyDaysAgo]);
        $usersByDay = $result->fetchAllAssociative();

        // Nouvelles annonces par jour (30 derniers jours)
        $sqlListings = "SELECT 
                           CAST(l.created_at AS DATE) as date,
                           COUNT(l.id) as count
                       FROM listings l
                       WHERE l.created_at >= :thirtyDaysAgo
                       GROUP BY CAST(l.created_at AS DATE)
                       ORDER BY date ASC";
        
        $stmt = $conn->prepare($sqlListings);
        $result = $stmt->executeQuery(['thirtyDaysAgo' => $thirtyDaysAgo]);
        $listingsByDay = $result->fetchAllAssociative();

        return $this->json([
            'growth' => [
                'usersByDay' => $usersByDay,
                'listingsByDay' => $listingsByDay
            ]
        ]);
    }
}
