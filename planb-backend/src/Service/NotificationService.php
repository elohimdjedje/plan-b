<?php

namespace App\Service;

use App\Entity\User;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

/**
 * Service de gestion des notifications (email, push, etc.)
 */
class NotificationService
{
    public function __construct(
        private MailerInterface $mailer,
        private SMSService $smsService,
        private LoggerInterface $logger
    ) {
    }

    /**
     * Notifier un nouvel abonnement PRO
     */
    public function notifyNewSubscription(User $user): void
    {
        try {
            $email = (new Email())
                ->from('noreply@planb.ci')
                ->to($user->getEmail())
                ->subject('Bienvenue dans Plan B PRO ! 🎉')
                ->html($this->getSubscriptionEmailTemplate($user));

            $this->mailer->send($email);
            
            $this->logger->info('Subscription notification sent', [
                'userId' => $user->getId(),
                'email' => $user->getEmail()
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Failed to send subscription notification', [
                'error' => $e->getMessage(),
                'userId' => $user->getId()
            ]);
        }
    }

    /**
     * Notifier l'expiration prochaine d'un abonnement
     */
    public function notifySubscriptionExpiringSoon(User $user, int $daysRemaining): void
    {
        try {
            $email = (new Email())
                ->from('noreply@planb.ci')
                ->to($user->getEmail())
                ->subject("Votre abonnement PRO expire dans {$daysRemaining} jours")
                ->html($this->getExpirationWarningTemplate($user, $daysRemaining));

            $this->mailer->send($email);
            
            // Envoyer aussi un SMS
            $message = "Plan B : Votre abonnement PRO expire dans {$daysRemaining} jours. Renouvelez maintenant sur app.planb.ci";
            $this->smsService->send($user->getPhone(), $message);
            
        } catch (\Exception $e) {
            $this->logger->error('Failed to send expiration warning', [
                'error' => $e->getMessage(),
                'userId' => $user->getId()
            ]);
        }
    }

    /**
     * Notifier un nouveau message
     */
    public function notifyNewMessage(User $recipient, User $sender, string $listingTitle): void
    {
        try {
            // Email
            $email = (new Email())
                ->from('noreply@planb.ci')
                ->to($recipient->getEmail())
                ->subject("Nouveau message concernant : {$listingTitle}")
                ->html($this->getNewMessageTemplate($recipient, $sender, $listingTitle));

            $this->mailer->send($email);
            
            // Push notification (à implémenter avec Firebase Cloud Messaging)
            // $this->sendPushNotification($recipient, ...);
            
        } catch (\Exception $e) {
            $this->logger->error('Failed to send message notification', [
                'error' => $e->getMessage(),
                'recipientId' => $recipient->getId()
            ]);
        }
    }

    /**
     * Notifier la publication d'une annonce
     */
    public function notifyListingPublished(User $user, string $listingTitle): void
    {
        try {
            $email = (new Email())
                ->from('noreply@planb.ci')
                ->to($user->getEmail())
                ->subject('Votre annonce est en ligne ! 🚀')
                ->html($this->getListingPublishedTemplate($user, $listingTitle));

            $this->mailer->send($email);
            
        } catch (\Exception $e) {
            $this->logger->error('Failed to send listing published notification', [
                'error' => $e->getMessage(),
                'userId' => $user->getId()
            ]);
        }
    }

    /**
     * Notifier l'expiration prochaine d'une annonce
     */
    public function notifyListingExpiringSoon(User $user, string $listingTitle, int $daysRemaining): void
    {
        try {
            $message = "Plan B : Votre annonce \"{$listingTitle}\" expire dans {$daysRemaining} jours.";
            $this->smsService->send($user->getPhone(), $message);
            
        } catch (\Exception $e) {
            $this->logger->error('Failed to send listing expiration warning', [
                'error' => $e->getMessage(),
                'userId' => $user->getId()
            ]);
        }
    }

    /**
     * Templates HTML des emails
     */
    private function getSubscriptionEmailTemplate(User $user): string
    {
        return "
            <h2>Bienvenue dans Plan B PRO, {$user->getFirstName()} ! 🎉</h2>
            <p>Votre abonnement PRO est maintenant actif.</p>
            <p><strong>Vos avantages :</strong></p>
            <ul>
                <li>✅ Annonces illimitées</li>
                <li>✅ Badge PRO visible</li>
                <li>✅ Statistiques avancées</li>
                <li>✅ Mise en avant de vos annonces</li>
                <li>✅ Durée de publication : 60 jours</li>
            </ul>
            <p>Commencez dès maintenant à publier vos annonces !</p>
            <a href='https://app.planb.ci/publish' style='background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Publier une annonce</a>
        ";
    }

    private function getExpirationWarningTemplate(User $user, int $daysRemaining): string
    {
        return "
            <h2>Bonjour {$user->getFirstName()},</h2>
            <p>Votre abonnement Plan B PRO expire dans <strong>{$daysRemaining} jours</strong>.</p>
            <p>Renouvelez maintenant pour continuer à profiter de tous les avantages PRO !</p>
            <a href='https://app.planb.ci/my-subscription' style='background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Renouveler mon abonnement</a>
        ";
    }

    private function getNewMessageTemplate(User $recipient, User $sender, string $listingTitle): string
    {
        return "
            <h2>Bonjour {$recipient->getFirstName()},</h2>
            <p><strong>{$sender->getFullName()}</strong> vous a envoyé un message concernant votre annonce :</p>
            <p><em>\"{$listingTitle}\"</em></p>
            <a href='https://app.planb.ci/conversations' style='background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Voir le message</a>
        ";
    }

    private function getListingPublishedTemplate(User $user, string $listingTitle): string
    {
        return "
            <h2>Félicitations {$user->getFirstName()} ! 🚀</h2>
            <p>Votre annonce <strong>\"{$listingTitle}\"</strong> est maintenant en ligne.</p>
            <p>Partagez-la pour augmenter votre visibilité !</p>
            <a href='https://app.planb.ci/profile' style='background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Voir mes annonces</a>
        ";
    }
}
