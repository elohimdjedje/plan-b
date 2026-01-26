# ✅ Entités Symfony Créées

## 📋 Liste des Entités

J'ai créé les entités suivantes pour le système de réservation et paiement :

### 1. ✅ Booking (Réservation)
**Fichier :** `planb-backend/src/Entity/Booking.php`

**Propriétés principales :**
- Relations : listing, tenant, owner
- Dates : startDate, endDate, checkInDate, checkOutDate
- Montants : totalAmount, depositAmount, monthlyRent, charges
- Statut : pending, accepted, rejected, confirmed, active, completed, cancelled
- Flags : depositPaid, firstRentPaid, depositReleased

**Méthodes utiles :**
- `getDurationInDays()` - Calcule la durée en jours
- `isActive()` - Vérifie si active
- `canBeCancelled()` - Vérifie si peut être annulée

---

### 2. ✅ BookingPayment (Paiement de Réservation)
**Fichier :** `planb-backend/src/Entity/BookingPayment.php`

**Propriétés principales :**
- Relations : booking, user
- Type : deposit, first_rent, monthly_rent, charges, penalty, refund
- Statut : pending, processing, completed, failed, refunded
- Méthode : wave, orange_money, mtn_money, card, bank_transfer
- Dates : dueDate, paidAt

**Méthodes utiles :**
- `isOverdue()` - Vérifie si en retard
- `getDaysOverdue()` - Calcule jours de retard
- `isCompleted()` - Vérifie si complété

---

### 3. ✅ EscrowAccount (Compte Séquestre)
**Fichier :** `planb-backend/src/Entity/EscrowAccount.php`

**Propriétés principales :**
- Relation : booking (OneToOne)
- Montants : depositAmount, firstRentAmount, totalHeld
- Statut : active, deposit_released, fully_released, disputed
- Dates : depositHeldAt, depositReleaseDate, depositReleasedAt, firstRentReleasedAt

**Méthodes utiles :**
- `canReleaseDeposit()` - Vérifie si caution peut être libérée
- `canReleaseFirstRent()` - Vérifie si premier loyer peut être libéré

---

### 4. ✅ Receipt (Quittance)
**Fichier :** `planb-backend/src/Entity/Receipt.php`

**Propriétés principales :**
- Relations : payment, booking
- Numéro unique : receiptNumber
- Période : periodStart, periodEnd
- Montants : rentAmount, chargesAmount, totalAmount
- PDF : pdfUrl

**Méthodes utiles :**
- `generateReceiptNumber()` - Génère numéro unique

---

### 5. ✅ Contract (Contrat)
**Fichier :** `planb-backend/src/Entity/Contract.php`

**Propriétés principales :**
- Relation : booking (OneToOne)
- Template : furnished_rental, unfurnished_rental, seasonal_rental
- Données : contractData (JSON)
- Signatures : ownerSignedAt, tenantSignedAt, ownerSignatureUrl, tenantSignatureUrl
- Statut : draft, sent, signed, archived

**Méthodes utiles :**
- `isFullySigned()` - Vérifie si signé par les deux parties
- `isOwnerSigned()` - Vérifie si propriétaire a signé
- `isTenantSigned()` - Vérifie si locataire a signé

---

### 6. ✅ PaymentReminder (Rappel de Paiement)
**Fichier :** `planb-backend/src/Entity/PaymentReminder.php`

**Propriétés principales :**
- Relations : payment, user
- Type : 7_days_before, 3_days_before, 1_day_before, overdue_1, overdue_3, overdue_7
- Canaux : emailSent, smsSent, pushSent
- Dates : scheduledAt, sentAt

**Méthodes utiles :**
- `shouldBeSent()` - Vérifie si doit être envoyé
- `markAsSent()` - Marque comme envoyé

---

## 📝 Prochaines Étapes

### À créer encore :
1. ⏳ `AvailabilityCalendar.php` - Calendrier de disponibilité
2. ⏳ `LatePaymentPenalty.php` - Pénalités de retard

### Repositories à créer :
- `BookingRepository.php`
- `BookingPaymentRepository.php`
- `EscrowAccountRepository.php`
- `ReceiptRepository.php`
- `ContractRepository.php`
- `PaymentReminderRepository.php`

### Services à créer :
- `BookingService.php`
- `PaymentService.php`
- `EscrowService.php`
- `ReceiptService.php` (génération PDF)
- `ReminderService.php`

---

## ✅ Statut

**Entités créées :** 6/8  
**Repositories :** 0/6  
**Services :** 0/5  
**Controllers :** 0/4

**Progression :** ~30% de la Phase 1 complétée

---

**Prêt pour continuer avec les repositories et services !** 🚀
