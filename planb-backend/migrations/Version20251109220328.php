<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251109220328 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE images DROP CONSTRAINT FK_E01FBE6AA76ED395');
        $this->addSql('ALTER TABLE images DROP CONSTRAINT FK_E01FBE6AD4619D1A');
        $this->addSql('ALTER TABLE images ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE images ALTER uploaded_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN images.uploaded_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE images ADD CONSTRAINT FK_E01FBE6AA76ED395 FOREIGN KEY (user_id) REFERENCES "users" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE images ADD CONSTRAINT FK_E01FBE6AD4619D1A FOREIGN KEY (listing_id) REFERENCES listings (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE listings DROP CONSTRAINT fk_520d4edaa76ed395');
        $this->addSql('ALTER TABLE listings ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE listings ALTER views_count DROP DEFAULT');
        $this->addSql('ALTER TABLE listings ALTER contacts_count DROP DEFAULT');
        $this->addSql('ALTER TABLE listings ALTER is_featured DROP DEFAULT');
        $this->addSql('ALTER TABLE listings ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN listings.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE listings ADD CONSTRAINT FK_9A7BD98EA76ED395 FOREIGN KEY (user_id) REFERENCES "users" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER INDEX idx_520d4edaa76ed395 RENAME TO IDX_9A7BD98EA76ED395');
        $this->addSql('ALTER TABLE payments DROP CONSTRAINT FK_65D29B32A76ED395');
        $this->addSql('ALTER TABLE payments ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE payments ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN payments.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE payments ADD CONSTRAINT FK_65D29B32A76ED395 FOREIGN KEY (user_id) REFERENCES "users" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE subscriptions DROP CONSTRAINT FK_4778A01A76ED395');
        $this->addSql('ALTER TABLE subscriptions ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE subscriptions ALTER auto_renew DROP DEFAULT');
        $this->addSql('ALTER TABLE subscriptions ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN subscriptions.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE subscriptions ADD CONSTRAINT FK_4778A01A76ED395 FOREIGN KEY (user_id) REFERENCES "users" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE users ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE users ALTER is_email_verified DROP DEFAULT');
        $this->addSql('ALTER TABLE users ALTER is_phone_verified DROP DEFAULT');
        $this->addSql('ALTER TABLE users ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('ALTER TABLE users ALTER is_lifetime_pro DROP DEFAULT');
        $this->addSql('COMMENT ON COLUMN users.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER INDEX uniq_444f97dd444f97dd RENAME TO UNIQ_1483A5E9444F97DD');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE subscriptions DROP CONSTRAINT fk_4778a01a76ed395');
        $this->addSql('CREATE SEQUENCE subscriptions_id_seq');
        $this->addSql('SELECT setval(\'subscriptions_id_seq\', (SELECT MAX(id) FROM subscriptions))');
        $this->addSql('ALTER TABLE subscriptions ALTER id SET DEFAULT nextval(\'subscriptions_id_seq\')');
        $this->addSql('ALTER TABLE subscriptions ALTER auto_renew SET DEFAULT false');
        $this->addSql('ALTER TABLE subscriptions ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN subscriptions.created_at IS NULL');
        $this->addSql('ALTER TABLE subscriptions ADD CONSTRAINT fk_4778a01a76ed395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE payments DROP CONSTRAINT fk_65d29b32a76ed395');
        $this->addSql('CREATE SEQUENCE payments_id_seq');
        $this->addSql('SELECT setval(\'payments_id_seq\', (SELECT MAX(id) FROM payments))');
        $this->addSql('ALTER TABLE payments ALTER id SET DEFAULT nextval(\'payments_id_seq\')');
        $this->addSql('ALTER TABLE payments ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN payments.created_at IS NULL');
        $this->addSql('ALTER TABLE payments ADD CONSTRAINT fk_65d29b32a76ed395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE images DROP CONSTRAINT fk_e01fbe6ad4619d1a');
        $this->addSql('ALTER TABLE images DROP CONSTRAINT fk_e01fbe6aa76ed395');
        $this->addSql('CREATE SEQUENCE images_id_seq');
        $this->addSql('SELECT setval(\'images_id_seq\', (SELECT MAX(id) FROM images))');
        $this->addSql('ALTER TABLE images ALTER id SET DEFAULT nextval(\'images_id_seq\')');
        $this->addSql('ALTER TABLE images ALTER uploaded_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN images.uploaded_at IS NULL');
        $this->addSql('ALTER TABLE images ADD CONSTRAINT fk_e01fbe6ad4619d1a FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE images ADD CONSTRAINT fk_e01fbe6aa76ed395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE listings DROP CONSTRAINT FK_9A7BD98EA76ED395');
        $this->addSql('CREATE SEQUENCE listings_id_seq');
        $this->addSql('SELECT setval(\'listings_id_seq\', (SELECT MAX(id) FROM listings))');
        $this->addSql('ALTER TABLE listings ALTER id SET DEFAULT nextval(\'listings_id_seq\')');
        $this->addSql('ALTER TABLE listings ALTER views_count SET DEFAULT 0');
        $this->addSql('ALTER TABLE listings ALTER contacts_count SET DEFAULT 0');
        $this->addSql('ALTER TABLE listings ALTER is_featured SET DEFAULT false');
        $this->addSql('ALTER TABLE listings ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN listings.created_at IS NULL');
        $this->addSql('ALTER TABLE listings ADD CONSTRAINT fk_520d4edaa76ed395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER INDEX idx_9a7bd98ea76ed395 RENAME TO idx_520d4edaa76ed395');
        $this->addSql('CREATE SEQUENCE users_id_seq');
        $this->addSql('SELECT setval(\'users_id_seq\', (SELECT MAX(id) FROM "users"))');
        $this->addSql('ALTER TABLE "users" ALTER id SET DEFAULT nextval(\'users_id_seq\')');
        $this->addSql('ALTER TABLE "users" ALTER is_email_verified SET DEFAULT false');
        $this->addSql('ALTER TABLE "users" ALTER is_phone_verified SET DEFAULT false');
        $this->addSql('ALTER TABLE "users" ALTER is_lifetime_pro SET DEFAULT false');
        $this->addSql('ALTER TABLE "users" ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN "users".created_at IS NULL');
        $this->addSql('ALTER INDEX uniq_1483a5e9444f97dd RENAME TO uniq_444f97dd444f97dd');
    }
}
