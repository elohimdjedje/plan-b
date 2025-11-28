<?php

namespace App\Command;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-admin',
    description: 'Créer un utilisateur administrateur'
)]
class CreateAdminCommand extends Command
{
    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Email de l\'administrateur')
            ->addArgument('password', InputArgument::REQUIRED, 'Mot de passe')
            ->addArgument('phone', InputArgument::OPTIONAL, 'Numéro de téléphone (+22507123456)')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $email = $input->getArgument('email');
        $password = $input->getArgument('password');
        $phone = $input->getArgument('phone') ?? '+22507000000';

        // Vérifier si l'email existe déjà
        $existingUser = $this->userRepository->findOneBy(['email' => $email]);

        if ($existingUser) {
            // Si l'utilisateur existe, le promouvoir en admin
            $existingUser->setRoles(['ROLE_USER', 'ROLE_ADMIN']);
            $this->entityManager->flush();

            $io->success("Utilisateur $email promu en administrateur !");
            return Command::SUCCESS;
        }

        // Créer un nouvel utilisateur admin
        $admin = new User();
        $admin->setEmail($email);
        $admin->setPhone($phone);
        $admin->setFirstName('Admin');
        $admin->setLastName('System');
        $admin->setCountry('CI');
        $admin->setCity('Abidjan');
        $admin->setRoles(['ROLE_USER', 'ROLE_ADMIN']);
        $admin->setAccountType('PRO');
        $admin->setIsLifetimePro(true);  // Admin PRO à vie
        $admin->setIsEmailVerified(true);
        $admin->setIsPhoneVerified(true);

        // Hasher le mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword($admin, $password);
        $admin->setPassword($hashedPassword);

        $this->entityManager->persist($admin);
        $this->entityManager->flush();

        $io->success('Administrateur créé avec succès !');
        $io->table(
            ['Propriété', 'Valeur'],
            [
                ['Email', $email],
                ['Téléphone', $phone],
                ['Rôles', 'ROLE_USER, ROLE_ADMIN'],
                ['Compte', 'PRO (illimité)']
            ]
        );

        $io->note('Vous pouvez maintenant vous connecter avec ces identifiants.');
        $io->note("Endpoint de connexion : POST /api/v1/auth/login");

        return Command::SUCCESS;
    }
}
