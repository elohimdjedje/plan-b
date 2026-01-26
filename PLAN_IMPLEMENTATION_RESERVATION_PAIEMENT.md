# 🏠 Plan d'Implémentation - Système de Réservation & Paiement

## 📋 Vue d'Ensemble

Ce document détaille l'implémentation progressive du système complet de réservation, paiement sécurisé, et gestion locative pour Plan B.

**Objectif :** Transformer Plan B en plateforme de gestion locative professionnelle avec paiements intégrés.

---

## 🎯 PHASE 1 - FONDATIONS (Semaines 1-4)

### 1.1 Architecture Base de Données

#### Nouvelles Tables à Créer

```sql
-- Réservations
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    tenant_id INT REFERENCES users(id) ON DELETE SET NULL,
    owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    check_in_date DATE,
    check_out_date DATE,
    
    -- Montants
    total_amount DECIMAL(12,2) NOT NULL,
    deposit_amount DECIMAL(12,2) NOT NULL,
    monthly_rent DECIMAL(12,2) NOT NULL,
    charges DECIMAL(12,2) DEFAULT 0,
    
    -- Statut
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending, accepted, rejected, confirmed, active, completed, cancelled
    
    -- Paiements
    deposit_paid BOOLEAN DEFAULT FALSE,
    first_rent_paid BOOLEAN DEFAULT FALSE,
    deposit_released BOOLEAN DEFAULT FALSE,
    
    -- Dates importantes
    requested_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Métadonnées
    tenant_message TEXT,
    owner_response TEXT,
    cancellation_reason TEXT,
    
    CONSTRAINT valid_dates CHECK (end_date > start_date),
    CONSTRAINT valid_amounts CHECK (total_amount > 0 AND deposit_amount > 0)
);

CREATE INDEX idx_bookings_listing ON bookings(listing_id);
CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX idx_bookings_owner ON bookings(owner_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

-- Paiements
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Type de paiement
    type VARCHAR(20) NOT NULL,
    -- deposit, first_rent, monthly_rent, charges, penalty, refund
    
    -- Montant
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF',
    
    -- Statut
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending, processing, completed, failed, refunded
    
    -- Méthode de paiement
    payment_method VARCHAR(20) NOT NULL,
    -- wave, orange_money, mtn_money, card, bank_transfer
    
    -- Transaction
    transaction_id VARCHAR(255),
    external_reference VARCHAR(255),
    
    -- Dates
    due_date DATE,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Métadonnées
    metadata JSONB,
    
    CONSTRAINT valid_amount CHECK (amount > 0)
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);

-- Compte séquestre (Escrow)
CREATE TABLE escrow_accounts (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    
    -- Montants
    deposit_amount DECIMAL(12,2) NOT NULL,
    first_rent_amount DECIMAL(12,2) NOT NULL,
    total_held DECIMAL(12,2) NOT NULL,
    
    -- Statut
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    -- active, deposit_released, fully_released, disputed
    
    -- Dates
    deposit_held_at TIMESTAMP DEFAULT NOW(),
    deposit_release_date DATE,
    deposit_released_at TIMESTAMP,
    first_rent_released_at TIMESTAMP,
    
    -- Raison de libération
    release_reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_escrow_booking ON escrow_accounts(booking_id);
CREATE INDEX idx_escrow_status ON escrow_accounts(status);

-- Documents
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    
    -- Template
    template_type VARCHAR(50) NOT NULL,
    -- furnished_rental, unfurnished_rental, seasonal_rental
    
    -- Contenu
    contract_data JSONB NOT NULL,
    pdf_url TEXT,
    
    -- Signatures
    owner_signed_at TIMESTAMP,
    tenant_signed_at TIMESTAMP,
    owner_signature_url TEXT,
    tenant_signature_url TEXT,
    
    -- Statut
    status VARCHAR(20) DEFAULT 'draft',
    -- draft, sent, signed, archived
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contracts_booking ON contracts(booking_id);

-- Quittances
CREATE TABLE receipts (
    id SERIAL PRIMARY KEY,
    payment_id INT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    
    -- Numérotation
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Période
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Montants
    rent_amount DECIMAL(12,2) NOT NULL,
    charges_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    
    -- Document
    pdf_url TEXT,
    
    -- Dates
    issued_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT valid_period CHECK (period_end > period_start)
);

CREATE INDEX idx_receipts_payment ON receipts(payment_id);
CREATE INDEX idx_receipts_booking ON receipts(booking_id);
CREATE INDEX idx_receipts_number ON receipts(receipt_number);

-- Calendrier de disponibilité
CREATE TABLE availability_calendar (
    id SERIAL PRIMARY KEY,
    listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    
    -- Date
    date DATE NOT NULL,
    
    -- Disponibilité
    is_available BOOLEAN DEFAULT TRUE,
    is_blocked BOOLEAN DEFAULT FALSE,
    
    -- Prix (si différent du prix de base)
    price_override DECIMAL(12,2),
    
    -- Raison du blocage
    block_reason TEXT,
    
    UNIQUE(listing_id, date)
);

CREATE INDEX idx_calendar_listing ON availability_calendar(listing_id);
CREATE INDEX idx_calendar_date ON availability_calendar(date);
CREATE INDEX idx_calendar_available ON availability_calendar(listing_id, date, is_available);

-- Rappels de paiement
CREATE TABLE payment_reminders (
    id SERIAL PRIMARY KEY,
    payment_id INT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Type de rappel
    reminder_type VARCHAR(20) NOT NULL,
    -- 7_days_before, 3_days_before, 1_day_before, overdue_1, overdue_3, overdue_7
    
    -- Statut
    status VARCHAR(20) DEFAULT 'pending',
    -- pending, sent, failed
    
    -- Canaux
    email_sent BOOLEAN DEFAULT FALSE,
    sms_sent BOOLEAN DEFAULT FALSE,
    push_sent BOOLEAN DEFAULT FALSE,
    
    -- Dates
    scheduled_at TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reminders_payment ON payment_reminders(payment_id);
CREATE INDEX idx_reminders_user ON payment_reminders(user_id);
CREATE INDEX idx_reminders_scheduled ON payment_reminders(scheduled_at, status);

-- Pénalités de retard
CREATE TABLE late_payment_penalties (
    id SERIAL PRIMARY KEY,
    payment_id INT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    
    -- Calcul
    days_late INT NOT NULL,
    penalty_rate DECIMAL(5,2) NOT NULL, -- Pourcentage
    penalty_amount DECIMAL(12,2) NOT NULL,
    
    -- Statut
    status VARCHAR(20) DEFAULT 'pending',
    -- pending, paid, waived
    
    -- Dates
    calculated_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP,
    
    CONSTRAINT valid_days CHECK (days_late > 0),
    CONSTRAINT valid_rate CHECK (penalty_rate >= 0 AND penalty_rate <= 100)
);

CREATE INDEX idx_penalties_payment ON late_payment_penalties(payment_id);
CREATE INDEX idx_penalties_booking ON late_payment_penalties(booking_id);
```

#### Modifications Tables Existantes

```sql
-- Ajouter colonnes à listings pour réservations
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS min_rental_days INT DEFAULT 30,
ADD COLUMN IF NOT EXISTS max_rental_days INT,
ADD COLUMN IF NOT EXISTS deposit_months DECIMAL(3,1) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS advance_notice_days INT DEFAULT 30,
ADD COLUMN IF NOT EXISTS allows_short_term BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS allows_long_term BOOLEAN DEFAULT TRUE;

-- Ajouter colonnes à users pour gestion financière
ALTER TABLE users
ADD COLUMN IF NOT EXISTS bank_account_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reliability_score INT DEFAULT 100,
ADD COLUMN IF NOT EXISTS late_payments_count INT DEFAULT 0;
```

---

## 🏗️ PHASE 2 - BACKEND SYMFONY (Semaines 5-8)

### 2.1 Entités Doctrine

Fichiers à créer :
- `src/Entity/Booking.php`
- `src/Entity/Payment.php`
- `src/Entity/EscrowAccount.php`
- `src/Entity/Contract.php`
- `src/Entity/Receipt.php`
- `src/Entity/AvailabilityCalendar.php`
- `src/Entity/PaymentReminder.php`
- `src/Entity/LatePaymentPenalty.php`

### 2.2 Controllers API

- `src/Controller/Api/BookingController.php`
- `src/Controller/Api/PaymentController.php`
- `src/Controller/Api/EscrowController.php`
- `src/Controller/Api/ContractController.php`
- `src/Controller/Api/ReceiptController.php`
- `src/Controller/Api/AvailabilityController.php`

### 2.3 Services

- `src/Service/BookingService.php` - Logique métier réservations
- `src/Service/PaymentService.php` - Gestion paiements
- `src/Service/EscrowService.php` - Gestion compte séquestre
- `src/Service/ContractService.php` - Génération contrats
- `src/Service/ReceiptService.php` - Génération quittances PDF
- `src/Service/ReminderService.php` - Système de rappels
- `src/Service/PenaltyService.php` - Calcul pénalités
- `src/Service/WavePaymentService.php` - Intégration Wave
- `src/Service/OrangeMoneyService.php` - Intégration Orange Money

---

## 🎨 PHASE 3 - FRONTEND REACT (Semaines 9-12)

### 3.1 Pages

- `src/pages/BookingRequest.jsx` - Demande de réservation
- `src/pages/BookingManagement.jsx` - Gestion réservations
- `src/pages/PaymentDashboard.jsx` - Tableau de bord paiements
- `src/pages/Contracts.jsx` - Contrats et documents
- `src/pages/Receipts.jsx` - Quittances
- `src/pages/Calendar.jsx` - Calendrier disponibilité

### 3.2 Composants

- `src/components/booking/BookingCalendar.jsx`
- `src/components/booking/BookingCard.jsx`
- `src/components/booking/BookingStatus.jsx`
- `src/components/payment/PaymentForm.jsx`
- `src/components/payment/PaymentHistory.jsx`
- `src/components/payment/EscrowInfo.jsx`
- `src/components/contract/ContractViewer.jsx`
- `src/components/contract/SignaturePad.jsx`
- `src/components/receipt/ReceiptViewer.jsx`
- `src/components/reminders/ReminderSettings.jsx`

### 3.3 API Clients

- `src/api/bookings.js`
- `src/api/payments.js`
- `src/api/contracts.js`
- `src/api/receipts.js`
- `src/api/availability.js`

---

## 📅 PHASE 4 - AUTOMATISATION (Semaines 13-16)

### 4.1 Jobs Asynchrones

- Calcul automatique pénalités
- Envoi rappels paiement
- Libération caution automatique
- Génération quittances mensuelles
- Nettoyage réservations expirées

### 4.2 Notifications

- Email transactionnels (SendGrid)
- SMS (Twilio)
- Push notifications (Firebase)
- In-app notifications

---

## 🚀 PRIORISATION D'IMPLÉMENTATION

### 🔴 PRIORITÉ 1 - Essentiel (MVP)
1. ✅ Tables BDD réservations et paiements
2. ✅ Système de réservation basique
3. ✅ Paiement caution + 1er loyer
4. ✅ Génération quittances PDF
5. ✅ Notifications rappel paiement

### 🟠 PRIORITÉ 2 - Important (V1.0)
6. ✅ Escrow complet
7. ✅ Prélèvements récurrents
8. ✅ Gestion retards
9. ✅ Génération contrats
10. ✅ Tableau de bord financier

### 🟡 PRIORITÉ 3 - Avancé (V2.0)
11. ⏳ Calendrier disponibilité avancé
12. ⏳ Signature électronique
13. ⏳ État des lieux numérique
14. ⏳ Analytics IA
15. ⏳ Protection juridique

---

## 📝 PROCHAINES ÉTAPES IMMÉDIATES

1. **Créer les migrations SQL** (aujourd'hui)
2. **Créer les entités Symfony** (semaine 1)
3. **Implémenter BookingController** (semaine 1-2)
4. **Créer composants React de base** (semaine 2-3)
5. **Intégrer paiement Wave** (semaine 3-4)
6. **Génération PDF quittances** (semaine 4)

---

**Prêt à commencer l'implémentation !** 🚀
