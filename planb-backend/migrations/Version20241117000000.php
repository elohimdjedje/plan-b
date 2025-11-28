<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour simplifier l'authentification
 * - Ajouter whatsappPhone et bio
 * - Rendre phone, country et city nullable
 */
final class Version20241117000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Simplification de l\'authentification : ajout whatsappPhone et bio, champs optionnels';
    }

    public function up(Schema $schema): void
    {
        // Ajouter les nouveaux champs
        $this->addSql('ALTER TABLE users ADD whatsapp_phone VARCHAR(20) DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD bio TEXT DEFAULT NULL');
        
        // Rendre phone nullable et retirer la contrainte NOT NULL
        $this->addSql('ALTER TABLE users ALTER COLUMN phone DROP NOT NULL');
        
        // Rendre country et city nullable
        $this->addSql('ALTER TABLE users ALTER COLUMN country DROP NOT NULL');
        $this->addSql('ALTER TABLE users ALTER COLUMN city DROP NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // Supprimer les champs ajoutés
        $this->addSql('ALTER TABLE users DROP COLUMN whatsapp_phone');
        $this->addSql('ALTER TABLE users DROP COLUMN bio');
        
        // Remettre les contraintes NOT NULL (attention, peut échouer si des valeurs NULL existent)
        $this->addSql('ALTER TABLE users ALTER COLUMN phone SET NOT NULL');
        $this->addSql('ALTER TABLE users ALTER COLUMN country SET NOT NULL');
        $this->addSql('ALTER TABLE users ALTER COLUMN city SET NOT NULL');
    }
}
