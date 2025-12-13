<?php

namespace App\Controller\Api;

use App\Entity\Notification;
use App\Repository\NotificationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/notifications')]
#[IsGranted('ROLE_USER')]
class NotificationController extends AbstractController
{
    private NotificationRepository $notificationRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(
        NotificationRepository $notificationRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->notificationRepository = $notificationRepository;
        $this->entityManager = $entityManager;
    }

    /**
     * Récupère la liste des notifications de l'utilisateur connecté
     */
    #[Route('', name: 'api_notifications_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $status = $request->query->get('status'); // 'unread', 'read', 'archived' ou null (tous)
        $limit = (int) $request->query->get('limit', 50);

        $notifications = $this->notificationRepository->findByUser($user, $status, $limit);

        return $this->json([
            'success' => true,
            'data' => array_map(function (Notification $notif) {
                return [
                    'id' => $notif->getId(),
                    'type' => $notif->getType(),
                    'title' => $notif->getTitle(),
                    'message' => $notif->getMessage(),
                    'data' => $notif->getData(),
                    'priority' => $notif->getPriority(),
                    'status' => $notif->getStatus(),
                    'createdAt' => $notif->getCreatedAt()->format('c'),
                    'readAt' => $notif->getReadAt()?->format('c'),
                    'isRead' => $notif->isRead(),
                ];
            }, $notifications)
        ]);
    }

    /**
     * Compte les notifications non lues
     */
    #[Route('/unread-count', name: 'api_notifications_unread_count', methods: ['GET'])]
    public function unreadCount(): JsonResponse
    {
        $user = $this->getUser();
        $count = $this->notificationRepository->countUnread($user);

        return $this->json([
            'success' => true,
            'count' => $count
        ]);
    }

    /**
     * Marque une notification comme lue
     */
    #[Route('/{id}/read', name: 'api_notifications_mark_read', methods: ['POST'])]
    public function markAsRead(int $id): JsonResponse
    {
        $user = $this->getUser();
        $notification = $this->notificationRepository->find($id);

        if (!$notification || $notification->getUser() !== $user) {
            return $this->json([
                'success' => false,
                'message' => 'Notification introuvable'
            ], Response::HTTP_NOT_FOUND);
        }

        if (!$notification->isRead()) {
            $notification->markAsRead();
            $this->entityManager->flush();
        }

        return $this->json([
            'success' => true,
            'message' => 'Notification marquée comme lue'
        ]);
    }

    /**
     * Marque toutes les notifications comme lues
     */
    #[Route('/read-all', name: 'api_notifications_mark_all_read', methods: ['POST'])]
    public function markAllAsRead(): JsonResponse
    {
        $user = $this->getUser();
        $count = $this->notificationRepository->markAllAsRead($user);

        return $this->json([
            'success' => true,
            'message' => "{$count} notifications marquées comme lues",
            'count' => $count
        ]);
    }

    /**
     * Supprime une notification
     */
    #[Route('/{id}', name: 'api_notifications_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();
        $notification = $this->notificationRepository->find($id);

        if (!$notification || $notification->getUser() !== $user) {
            return $this->json([
                'success' => false,
                'message' => 'Notification introuvable'
            ], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($notification);
        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Notification supprimée'
        ]);
    }
}
