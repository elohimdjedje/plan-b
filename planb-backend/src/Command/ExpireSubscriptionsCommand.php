<?php

namespace App\Command;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:expire-subscriptions',
    description: 'Expire les abonnements PRO arrivés à terme (à exécuter via CRON)'
)]
class ExpireSubscriptionsCommand extends Command
{
    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Expiration des abonnements PRO');

        $now = new \DateTimeImmutable();

        // Trouver tous les utilisateurs PRO dont l'abonnement a expiré
        $qb = $this->entityManager->createQueryBuilder();
        $expiredUsers = $qb->select('u')
            ->from('App\Entity\User', 'u')
            ->where('u.accountType = :pro')
            ->andWhere('u.subscriptionExpiresAt IS NOT NULL')
            ->andWhere('u.subscriptionExpiresAt < :now')
            ->andWhere('u.isLifetimePro = false')  // Exclure les PRO à vie
            ->setParameter('pro', 'PRO')
            ->setParameter('now', $now)
            ->getQuery()
            ->getResult();

        $count = count($expiredUsers);

        if ($count === 0) {
            $io->success('Aucun abonnement expiré trouvé.');
            return Command::SUCCESS;
        }

        $io->info("$count abonnement(s) PRO expiré(s) trouvé(s)");

        // Repasser chaque utilisateur en FREE
        foreach ($expiredUsers as $user) {
            $user->setAccountType('FREE');
            $user->setSubscriptionExpiresAt(null);

            // Mettre à jour l'abonnement
            $subscription = $user->getSubscription();
            if ($subscription) {
                $subscription->setStatus('expired');
                $subscription->setUpdatedAt(new \DateTimeImmutable());
            }

            $io->writeln(" - {$user->getEmail()} : PRO → FREE");
        }

        $this->entityManager->flush();

        $io->success("$count utilisateur(s) repassé(s) en FREE avec succès !");

        return Command::SUCCESS;
    }
}
