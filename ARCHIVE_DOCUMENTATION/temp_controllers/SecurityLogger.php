<?php

namespace App\Service;

use App\Entity\SecurityLog;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Service de logging des événements de sécurité
 */
class SecurityLogger
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
    }

    /**
     * Logger une connexion réussie
     */
    public function logLogin(User $user, Request $request): void
    {
        $this->log(
            user: $user,
            action: 'login',
            request: $request,
            severity: 'info',
            context: [
                'email' => $user->getEmail()
            ]
        );
    }

    /**
     * Logger une tentative de connexion échouée
     */
    public function logFailedLogin(string $email, Request $request): void
    {
        $this->log(
            user: null,
            action: 'failed_login',
            request: $request,
            severity: 'warning',
            context: [
                'email' => $email
            ]
        );
    }

    /**
     * Logger un changement de mot de passe
     */
    public function logPasswordChange(User $user, Request $request): void
    {
        $this->log(
            user: $user,
            action: 'password_change',
            request: $request,
            severity: 'info'
        );
    }

    /**
     * Logger une inscription
     */
    public function logRegister(User $user, Request $request): void
    {
        $this->log(
            user: $user,
            action: 'register',
            request: $request,
            severity: 'info',
            context: [
                'email' => $user->getEmail(),
                'phone' => $user->getPhone(),
                'country' => $user->getCountry()
            ]
        );
    }

    /**
     * Logger une déconnexion
     */
    public function logLogout(User $user, Request $request): void
    {
        $this->log(
            user: $user,
            action: 'logout',
            request: $request,
            severity: 'info'
        );
    }

    /**
     * Logger une activité suspecte
     */
    public function logSuspiciousActivity(
        ?User $user,
        string $action,
        Request $request,
        array $context = []
    ): void {
        $this->log(
            user: $user,
            action: $action,
            request: $request,
            severity: 'critical',
            context: $context
        );
    }

    /**
     * Logger une mise à jour de profil
     */
    public function logProfileUpdate(User $user, Request $request, array $changes): void
    {
        $this->log(
            user: $user,
            action: 'profile_update',
            request: $request,
            severity: 'info',
            context: ['changes' => $changes]
        );
    }

    /**
     * Logger une suppression de compte
     */
    public function logAccountDeletion(User $user, Request $request): void
    {
        $this->log(
            user: $user,
            action: 'account_deletion',
            request: $request,
            severity: 'warning',
            context: [
                'email' => $user->getEmail()
            ]
        );
    }

    /**
     * Méthode privée de logging
     */
    private function log(
        ?User $user,
        string $action,
        Request $request,
        string $severity = 'info',
        array $context = []
    ): void {
        $log = new SecurityLog();
        
        if ($user) {
            $log->setUser($user);
        }
        
        $log->setAction($action);
        $log->setIpAddress($request->getClientIp() ?? 'unknown');
        $log->setUserAgent($request->headers->get('User-Agent'));
        $log->setSeverity($severity);
        $log->setContext($context);

        $this->entityManager->persist($log);
        $this->entityManager->flush();
    }

    /**
     * Vérifier si une IP a trop de tentatives échouées
     */
    public function hasExcessiveFailedAttempts(string $ipAddress, int $maxAttempts = 5, int $minutes = 15): bool
    {
        $since = new \DateTimeImmutable("-{$minutes} minutes");
        
        $count = $this->entityManager->getRepository(SecurityLog::class)
            ->countFailedLoginsByIp($ipAddress, $since);

        return $count >= $maxAttempts;
    }
}
