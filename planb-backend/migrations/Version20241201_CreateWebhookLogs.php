<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour créer la table webhook_logs
 */
final class Version20241201_CreateWebhookLogs extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Création de la table webhook_logs pour l\'audit des webhooks de paiement';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('
            CREATE TABLE webhook_logs (
                id SERIAL PRIMARY KEY,
                provider VARCHAR(50) NOT NULL,
                payload TEXT NOT NULL,
                signature TEXT,
                transaction_id VARCHAR(255),
                event_type VARCHAR(100),
                status VARCHAR(20) NOT NULL DEFAULT \'received\',
                error_message TEXT,
                ip_address VARCHAR(45),
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                processed_at TIMESTAMP(0) WITHOUT TIME ZONE
            )
        ');

        $this->addSql('CREATE INDEX idx_webhook_provider_status ON webhook_logs(provider, status)');
        $this->addSql('CREATE INDEX idx_webhook_transaction ON webhook_logs(transaction_id)');
        $this->addSql('CREATE INDEX idx_webhook_created ON webhook_logs(created_at)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX IF EXISTS idx_webhook_created');
        $this->addSql('DROP INDEX IF EXISTS idx_webhook_transaction');
        $this->addSql('DROP INDEX IF EXISTS idx_webhook_provider_status');
        $this->addSql('DROP TABLE IF EXISTS webhook_logs');
    }
}


