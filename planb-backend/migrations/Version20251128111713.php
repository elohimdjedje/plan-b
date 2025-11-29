<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251128111713 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE conversations_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE favorites_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE messages_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE refresh_tokens_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE reports_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE reviews_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE security_logs_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE conversations (id INT NOT NULL, listing_id INT NOT NULL, buyer_id INT NOT NULL, seller_id INT NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, last_message_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_C2521BF1D4619D1A ON conversations (listing_id)');
        $this->addSql('CREATE INDEX idx_conversation_buyer ON conversations (buyer_id)');
        $this->addSql('CREATE INDEX idx_conversation_seller ON conversations (seller_id)');
        $this->addSql('CREATE INDEX idx_conversation_last_message ON conversations (last_message_at)');
        $this->addSql('CREATE UNIQUE INDEX listing_buyer_unique ON conversations (listing_id, buyer_id)');
        $this->addSql('COMMENT ON COLUMN conversations.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN conversations.last_message_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE favorites (id INT NOT NULL, user_id INT NOT NULL, listing_id INT NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX idx_favorite_user ON favorites (user_id)');
        $this->addSql('CREATE INDEX idx_favorite_listing ON favorites (listing_id)');
        $this->addSql('CREATE UNIQUE INDEX user_listing_unique ON favorites (user_id, listing_id)');
        $this->addSql('COMMENT ON COLUMN favorites.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE messages (id INT NOT NULL, conversation_id INT NOT NULL, sender_id INT NOT NULL, content TEXT NOT NULL, is_read BOOLEAN NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, read_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX idx_message_conversation ON messages (conversation_id)');
        $this->addSql('CREATE INDEX idx_message_sender ON messages (sender_id)');
        $this->addSql('CREATE INDEX idx_message_created ON messages (created_at)');
        $this->addSql('CREATE INDEX idx_message_read ON messages (is_read)');
        $this->addSql('COMMENT ON COLUMN messages.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN messages.read_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE refresh_tokens (id INT NOT NULL, user_id INT NOT NULL, token VARCHAR(255) NOT NULL, expires_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, ip_address VARCHAR(45) DEFAULT NULL, user_agent VARCHAR(500) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_9BACE7E15F37A13B ON refresh_tokens (token)');
        $this->addSql('CREATE INDEX IDX_9BACE7E1A76ED395 ON refresh_tokens (user_id)');
        $this->addSql('CREATE INDEX idx_refresh_token ON refresh_tokens (token)');
        $this->addSql('CREATE INDEX idx_refresh_expires ON refresh_tokens (expires_at)');
        $this->addSql('COMMENT ON COLUMN refresh_tokens.expires_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN refresh_tokens.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE reports (id INT NOT NULL, reporter_id INT DEFAULT NULL, listing_id INT NOT NULL, reason VARCHAR(50) NOT NULL, description TEXT DEFAULT NULL, status VARCHAR(20) NOT NULL, admin_notes TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, reviewed_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_F11FA745E1CFE6F5 ON reports (reporter_id)');
        $this->addSql('CREATE INDEX idx_report_status ON reports (status)');
        $this->addSql('CREATE INDEX idx_report_listing ON reports (listing_id)');
        $this->addSql('CREATE INDEX idx_report_created ON reports (created_at)');
        $this->addSql('COMMENT ON COLUMN reports.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN reports.reviewed_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE reviews (id INT NOT NULL, listing_id INT NOT NULL, reviewer_id INT NOT NULL, seller_id INT NOT NULL, rating SMALLINT NOT NULL, comment TEXT DEFAULT NULL, review_type VARCHAR(50) NOT NULL, is_verified BOOLEAN NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX idx_review_listing ON reviews (listing_id)');
        $this->addSql('CREATE INDEX idx_review_reviewer ON reviews (reviewer_id)');
        $this->addSql('CREATE INDEX idx_review_seller ON reviews (seller_id)');
        $this->addSql('CREATE INDEX idx_review_created ON reviews (created_at)');
        $this->addSql('COMMENT ON COLUMN reviews.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE security_logs (id INT NOT NULL, user_id INT DEFAULT NULL, action VARCHAR(50) NOT NULL, ip_address VARCHAR(45) NOT NULL, user_agent TEXT DEFAULT NULL, context JSON DEFAULT NULL, severity VARCHAR(20) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX idx_security_user ON security_logs (user_id)');
        $this->addSql('CREATE INDEX idx_security_action ON security_logs (action)');
        $this->addSql('CREATE INDEX idx_security_created ON security_logs (created_at)');
        $this->addSql('CREATE INDEX idx_security_ip ON security_logs (ip_address)');
        $this->addSql('COMMENT ON COLUMN security_logs.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE conversations ADD CONSTRAINT FK_C2521BF1D4619D1A FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE conversations ADD CONSTRAINT FK_C2521BF16C755722 FOREIGN KEY (buyer_id) REFERENCES "users" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE conversations ADD CONSTRAINT FK_C2521BF18DE820D9 FOREIGN KEY (seller_id) REFERENCES "users" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE favorites ADD CONSTRAINT FK_E46960F5A76ED395 FOREIGN KEY (user_id) REFERENCES "users" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE favorites ADD CONSTRAINT FK_E46960F5D4619D1A FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE messages ADD CONSTRAINT FK_DB021E969AC0396 FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE messages ADD CONSTRAINT FK_DB021E96F624B39D FOREIGN KEY (sender_id) REFERENCES "users" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE refresh_tokens ADD CONSTRAINT FK_9BACE7E1A76ED395 FOREIGN KEY (user_id) REFERENCES "users" (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE reports ADD CONSTRAINT FK_F11FA745E1CFE6F5 FOREIGN KEY (reporter_id) REFERENCES "users" (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE reports ADD CONSTRAINT FK_F11FA745D4619D1A FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE reviews ADD CONSTRAINT FK_6970EB0FD4619D1A FOREIGN KEY (listing_id) REFERENCES listings (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE reviews ADD CONSTRAINT FK_6970EB0F70574616 FOREIGN KEY (reviewer_id) REFERENCES "users" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE reviews ADD CONSTRAINT FK_6970EB0F8DE820D9 FOREIGN KEY (seller_id) REFERENCES "users" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE security_logs ADD CONSTRAINT FK_2F9E4A9DA76ED395 FOREIGN KEY (user_id) REFERENCES "users" (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('DROP INDEX idx_viewed_at');
        $this->addSql('ALTER TABLE listing_views ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE listing_views ALTER viewed_at DROP DEFAULT');
        $this->addSql('ALTER TABLE listings ADD contact_phone VARCHAR(20) DEFAULT NULL');
        $this->addSql('ALTER TABLE listings ADD contact_whatsapp VARCHAR(20) DEFAULT NULL');
        $this->addSql('ALTER TABLE listings ADD contact_email VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE listings ALTER price_unit DROP DEFAULT');
        $this->addSql('ALTER TABLE operations DROP CONSTRAINT fk_operations_order');
        $this->addSql('ALTER TABLE operations DROP CONSTRAINT fk_operations_provider');
        $this->addSql('ALTER TABLE operations DROP CONSTRAINT fk_operations_user');
        $this->addSql('ALTER TABLE operations ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE operations ALTER amount DROP DEFAULT');
        $this->addSql('ALTER TABLE operations ALTER amount SET NOT NULL');
        $this->addSql('ALTER TABLE operations ALTER balance_before DROP DEFAULT');
        $this->addSql('ALTER TABLE operations ALTER balance_before SET NOT NULL');
        $this->addSql('ALTER TABLE operations ALTER balance_after DROP DEFAULT');
        $this->addSql('ALTER TABLE operations ALTER balance_after SET NOT NULL');
        $this->addSql('ALTER TABLE operations ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('ALTER TABLE operations ALTER created_at DROP DEFAULT');
        $this->addSql('COMMENT ON COLUMN operations.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE operations ADD CONSTRAINT FK_28145348A76ED395 FOREIGN KEY (user_id) REFERENCES "users" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE operations ADD CONSTRAINT FK_28145348A53A8AA FOREIGN KEY (provider_id) REFERENCES "users" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE operations ADD CONSTRAINT FK_281453488D9F6D38 FOREIGN KEY (order_id) REFERENCES orders (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER INDEX idx_operation_user RENAME TO IDX_28145348A76ED395');
        $this->addSql('ALTER INDEX idx_operation_order RENAME TO IDX_281453488D9F6D38');
        $this->addSql('ALTER TABLE orders DROP CONSTRAINT fk_orders_client');
        $this->addSql('ALTER TABLE orders DROP CONSTRAINT fk_orders_provider');
        $this->addSql('ALTER TABLE orders ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE orders ALTER status DROP DEFAULT');
        $this->addSql('ALTER TABLE orders ALTER status SET NOT NULL');
        $this->addSql('ALTER TABLE orders ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('ALTER TABLE orders ALTER created_at DROP DEFAULT');
        $this->addSql('ALTER TABLE orders ALTER updated_at DROP DEFAULT');
        $this->addSql('COMMENT ON COLUMN orders.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE orders ADD CONSTRAINT FK_E52FFDEE19EB6921 FOREIGN KEY (client_id) REFERENCES "users" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE orders ADD CONSTRAINT FK_E52FFDEEA53A8AA FOREIGN KEY (provider_id) REFERENCES "users" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER INDEX idx_order_client RENAME TO IDX_E52FFDEE19EB6921');
        $this->addSql('ALTER INDEX idx_order_provider RENAME TO IDX_E52FFDEEA53A8AA');
        $this->addSql('DROP INDEX uniq_1483a5e9444f97dd');
        $this->addSql('ALTER TABLE users ALTER country TYPE VARCHAR(100)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE conversations_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE favorites_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE messages_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE refresh_tokens_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE reports_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE reviews_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE security_logs_id_seq CASCADE');
        $this->addSql('ALTER TABLE conversations DROP CONSTRAINT FK_C2521BF1D4619D1A');
        $this->addSql('ALTER TABLE conversations DROP CONSTRAINT FK_C2521BF16C755722');
        $this->addSql('ALTER TABLE conversations DROP CONSTRAINT FK_C2521BF18DE820D9');
        $this->addSql('ALTER TABLE favorites DROP CONSTRAINT FK_E46960F5A76ED395');
        $this->addSql('ALTER TABLE favorites DROP CONSTRAINT FK_E46960F5D4619D1A');
        $this->addSql('ALTER TABLE messages DROP CONSTRAINT FK_DB021E969AC0396');
        $this->addSql('ALTER TABLE messages DROP CONSTRAINT FK_DB021E96F624B39D');
        $this->addSql('ALTER TABLE refresh_tokens DROP CONSTRAINT FK_9BACE7E1A76ED395');
        $this->addSql('ALTER TABLE reports DROP CONSTRAINT FK_F11FA745E1CFE6F5');
        $this->addSql('ALTER TABLE reports DROP CONSTRAINT FK_F11FA745D4619D1A');
        $this->addSql('ALTER TABLE reviews DROP CONSTRAINT FK_6970EB0FD4619D1A');
        $this->addSql('ALTER TABLE reviews DROP CONSTRAINT FK_6970EB0F70574616');
        $this->addSql('ALTER TABLE reviews DROP CONSTRAINT FK_6970EB0F8DE820D9');
        $this->addSql('ALTER TABLE security_logs DROP CONSTRAINT FK_2F9E4A9DA76ED395');
        $this->addSql('DROP TABLE conversations');
        $this->addSql('DROP TABLE favorites');
        $this->addSql('DROP TABLE messages');
        $this->addSql('DROP TABLE refresh_tokens');
        $this->addSql('DROP TABLE reports');
        $this->addSql('DROP TABLE reviews');
        $this->addSql('DROP TABLE security_logs');
        $this->addSql('CREATE SEQUENCE listing_views_id_seq');
        $this->addSql('SELECT setval(\'listing_views_id_seq\', (SELECT MAX(id) FROM listing_views))');
        $this->addSql('ALTER TABLE listing_views ALTER id SET DEFAULT nextval(\'listing_views_id_seq\')');
        $this->addSql('ALTER TABLE listing_views ALTER viewed_at SET DEFAULT CURRENT_TIMESTAMP');
        $this->addSql('CREATE INDEX idx_viewed_at ON listing_views (viewed_at)');
        $this->addSql('ALTER TABLE operations DROP CONSTRAINT FK_28145348A76ED395');
        $this->addSql('ALTER TABLE operations DROP CONSTRAINT FK_28145348A53A8AA');
        $this->addSql('ALTER TABLE operations DROP CONSTRAINT FK_281453488D9F6D38');
        $this->addSql('CREATE SEQUENCE operations_id_seq');
        $this->addSql('SELECT setval(\'operations_id_seq\', (SELECT MAX(id) FROM operations))');
        $this->addSql('ALTER TABLE operations ALTER id SET DEFAULT nextval(\'operations_id_seq\')');
        $this->addSql('ALTER TABLE operations ALTER amount SET DEFAULT \'0.00\'');
        $this->addSql('ALTER TABLE operations ALTER amount DROP NOT NULL');
        $this->addSql('ALTER TABLE operations ALTER balance_before SET DEFAULT \'0.00\'');
        $this->addSql('ALTER TABLE operations ALTER balance_before DROP NOT NULL');
        $this->addSql('ALTER TABLE operations ALTER balance_after SET DEFAULT \'0.00\'');
        $this->addSql('ALTER TABLE operations ALTER balance_after DROP NOT NULL');
        $this->addSql('ALTER TABLE operations ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('ALTER TABLE operations ALTER created_at SET DEFAULT CURRENT_TIMESTAMP');
        $this->addSql('COMMENT ON COLUMN operations.created_at IS NULL');
        $this->addSql('ALTER TABLE operations ADD CONSTRAINT fk_operations_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE operations ADD CONSTRAINT fk_operations_provider FOREIGN KEY (provider_id) REFERENCES users (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE operations ADD CONSTRAINT fk_operations_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER INDEX idx_281453488d9f6d38 RENAME TO idx_operation_order');
        $this->addSql('ALTER INDEX idx_28145348a76ed395 RENAME TO idx_operation_user');
        $this->addSql('ALTER TABLE orders DROP CONSTRAINT FK_E52FFDEE19EB6921');
        $this->addSql('ALTER TABLE orders DROP CONSTRAINT FK_E52FFDEEA53A8AA');
        $this->addSql('CREATE SEQUENCE orders_id_seq');
        $this->addSql('SELECT setval(\'orders_id_seq\', (SELECT MAX(id) FROM orders))');
        $this->addSql('ALTER TABLE orders ALTER id SET DEFAULT nextval(\'orders_id_seq\')');
        $this->addSql('ALTER TABLE orders ALTER status SET DEFAULT false');
        $this->addSql('ALTER TABLE orders ALTER status DROP NOT NULL');
        $this->addSql('ALTER TABLE orders ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('ALTER TABLE orders ALTER created_at SET DEFAULT CURRENT_TIMESTAMP');
        $this->addSql('ALTER TABLE orders ALTER updated_at SET DEFAULT CURRENT_TIMESTAMP');
        $this->addSql('COMMENT ON COLUMN orders.created_at IS NULL');
        $this->addSql('ALTER TABLE orders ADD CONSTRAINT fk_orders_client FOREIGN KEY (client_id) REFERENCES users (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE orders ADD CONSTRAINT fk_orders_provider FOREIGN KEY (provider_id) REFERENCES users (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER INDEX idx_e52ffdee19eb6921 RENAME TO idx_order_client');
        $this->addSql('ALTER INDEX idx_e52ffdeea53a8aa RENAME TO idx_order_provider');
        $this->addSql('ALTER TABLE listings DROP contact_phone');
        $this->addSql('ALTER TABLE listings DROP contact_whatsapp');
        $this->addSql('ALTER TABLE listings DROP contact_email');
        $this->addSql('ALTER TABLE listings ALTER price_unit SET DEFAULT \'mois\'');
        $this->addSql('ALTER TABLE "users" ALTER country TYPE VARCHAR(2)');
        $this->addSql('CREATE UNIQUE INDEX uniq_1483a5e9444f97dd ON "users" (phone)');
    }
}
