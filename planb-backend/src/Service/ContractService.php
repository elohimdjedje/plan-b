<?php

namespace App\Service;

use App\Entity\Booking;
use App\Entity\Contract;
use App\Repository\ContractRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

/**
 * Service de génération de contrats de location
 */
class ContractService
{
    private string $contractsDir;

    public function __construct(
        private EntityManagerInterface $entityManager,
        private ContractRepository $contractRepository,
        private ParameterBagInterface $params,
        private LoggerInterface $logger
    ) {
        $this->contractsDir = $params->get('kernel.project_dir') . '/public/uploads/contracts';
        
        if (!is_dir($this->contractsDir)) {
            mkdir($this->contractsDir, 0755, true);
        }
    }

    /**
     * Génère un contrat pour une réservation
     */
    public function generateContract(Booking $booking, string $templateType = 'furnished_rental'): Contract
    {
        // Vérifier si un contrat existe déjà
        $existing = $this->contractRepository->findOneBy(['booking' => $booking]);
        if ($existing) {
            return $existing;
        }

        $listing = $booking->getListing();
        $owner = $booking->getOwner();
        $tenant = $booking->getTenant();

        // Préparer les données du contrat
        $contractData = [
            'owner' => [
                'name' => $owner->getFirstName() . ' ' . $owner->getLastName(),
                'email' => $owner->getEmail(),
                'phone' => $owner->getPhone(),
                'address' => $owner->getCity() . ', ' . $owner->getCountry()
            ],
            'tenant' => [
                'name' => $tenant->getFirstName() . ' ' . $tenant->getLastName(),
                'email' => $tenant->getEmail(),
                'phone' => $tenant->getPhone(),
                'address' => $tenant->getCity() . ', ' . $tenant->getCountry()
            ],
            'property' => [
                'title' => $listing->getTitle(),
                'address' => $listing->getAddress() ?? $listing->getCity(),
                'city' => $listing->getCity(),
                'country' => $listing->getCountry()
            ],
            'rental' => [
                'start_date' => $booking->getStartDate()->format('Y-m-d'),
                'end_date' => $booking->getEndDate()->format('Y-m-d'),
                'monthly_rent' => $booking->getMonthlyRent(),
                'deposit' => $booking->getDepositAmount(),
                'charges' => $booking->getCharges()
            ],
            'terms' => $this->getDefaultTerms($templateType),
            'generated_at' => (new \DateTime())->format('Y-m-d H:i:s')
        ];

        $contract = new Contract();
        $contract->setBooking($booking);
        $contract->setTemplateType($templateType);
        $contract->setContractData($contractData);
        $contract->setStatus('draft');

        $this->entityManager->persist($contract);
        $this->entityManager->flush();

        // Générer le PDF
        $pdfUrl = $this->generatePdf($contract);
        $contract->setPdfUrl($pdfUrl);
        $contract->setStatus('sent');

        $this->entityManager->flush();

        $this->logger->info('Contrat généré', [
            'contract_id' => $contract->getId(),
            'booking_id' => $booking->getId()
        ]);

        return $contract;
    }

    /**
     * Génère le PDF du contrat
     */
    private function generatePdf(Contract $contract): string
    {
        if (!class_exists(\Dompdf\Dompdf::class)) {
            $this->logger->warning('Dompdf non installé, contrat PDF non généré');
            return '';
        }

        try {
            $dompdf = new \Dompdf\Dompdf();
            $dompdf->loadHtml($this->generateContractHtml($contract));
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();

            $filename = 'contract_' . $contract->getBooking()->getId() . '.pdf';
            $filepath = $this->contractsDir . '/' . $filename;
            
            file_put_contents($filepath, $dompdf->output());

            $baseUrl = $_ENV['APP_URL'] ?? 'http://localhost:8000';
            return $baseUrl . '/uploads/contracts/' . $filename;
        } catch (\Exception $e) {
            $this->logger->error('Erreur génération PDF contrat', [
                'contract_id' => $contract->getId(),
                'error' => $e->getMessage()
            ]);
            return '';
        }
    }

    /**
     * Génère le HTML du contrat
     */
    private function generateContractHtml(Contract $contract): string
    {
        $data = $contract->getContractData();
        $booking = $contract->getBooking();

        $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Contrat de Location - {$booking->getId()}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; }
        h1 { color: #e67e22; }
        .section { margin: 20px 0; }
        .signature-area { margin-top: 60px; display: flex; justify-content: space-around; }
        .signature-box { width: 300px; text-align: center; border-top: 2px solid #333; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CONTRAT DE LOCATION</h1>
        <p>Réservation #{$booking->getId()}</p>
    </div>

    <div class="section">
        <h2>1. PARTIES</h2>
        <p><strong>Bailleur (Propriétaire):</strong></p>
        <p>{$data['owner']['name']}<br>
        {$data['owner']['email']}<br>
        {$data['owner']['phone']}</p>

        <p><strong>Locataire:</strong></p>
        <p>{$data['tenant']['name']}<br>
        {$data['tenant']['email']}<br>
        {$data['tenant']['phone']}</p>
    </div>

    <div class="section">
        <h2>2. BIEN LOUÉ</h2>
        <p><strong>{$data['property']['title']}</strong></p>
        <p>{$data['property']['address']}<br>
        {$data['property']['city']}, {$data['property']['country']}</p>
    </div>

    <div class="section">
        <h2>3. CONDITIONS DE LOCATION</h2>
        <p><strong>Durée:</strong> Du {$data['rental']['start_date']} au {$data['rental']['end_date']}</p>
        <p><strong>Loyer mensuel:</strong> {$data['rental']['monthly_rent']} XOF</p>
        <p><strong>Caution:</strong> {$data['rental']['deposit']} XOF</p>
        <p><strong>Charges:</strong> {$data['rental']['charges']} XOF</p>
    </div>

    <div class="section">
        <h2>4. CLAUSES</h2>
        {$this->formatTerms($data['terms'])}
    </div>

    <div class="signature-area">
        <div class="signature-box">
            <p>Le Bailleur</p>
            <p>{$data['owner']['name']}</p>
        </div>
        <div class="signature-box">
            <p>Le Locataire</p>
            <p>{$data['tenant']['name']}</p>
        </div>
    </div>

    <div style="margin-top: 40px; font-size: 12px; color: #666;">
        <p>Contrat généré le {$data['generated_at']} via Plan B</p>
    </div>
</body>
</html>
HTML;

        return $html;
    }

    /**
     * Formate les termes du contrat
     */
    private function formatTerms(array $terms): string
    {
        $html = '';
        foreach ($terms as $term) {
            $html .= "<p><strong>{$term['title']}</strong><br>{$term['content']}</p>";
        }
        return $html;
    }

    /**
     * Retourne les termes par défaut selon le type de contrat
     */
    private function getDefaultTerms(string $templateType): array
    {
        $baseTerms = [
            [
                'title' => 'Article 1 - Objet',
                'content' => 'Le présent contrat a pour objet la location du bien décrit ci-dessus.'
            ],
            [
                'title' => 'Article 2 - Durée',
                'content' => 'La location est conclue pour la durée indiquée ci-dessus.'
            ],
            [
                'title' => 'Article 3 - Loyer',
                'content' => 'Le loyer est payable mensuellement à terme échu.'
            ]
        ];

        if ($templateType === 'furnished_rental') {
            $baseTerms[] = [
                'title' => 'Article 4 - Mobilier',
                'content' => 'Le bien est loué meublé. L\'inventaire du mobilier est joint au présent contrat.'
            ];
        }

        return $baseTerms;
    }

    /**
     * Enregistre la signature du propriétaire
     */
    public function signByOwner(Contract $contract, string $signatureUrl): void
    {
        $contract->setOwnerSignedAt(new \DateTime());
        $contract->setOwnerSignatureUrl($signatureUrl);

        if ($contract->isFullySigned()) {
            $contract->setStatus('signed');
        }

        $this->entityManager->flush();
    }

    /**
     * Enregistre la signature du locataire
     */
    public function signByTenant(Contract $contract, string $signatureUrl): void
    {
        $contract->setTenantSignedAt(new \DateTime());
        $contract->setTenantSignatureUrl($signatureUrl);

        if ($contract->isFullySigned()) {
            $contract->setStatus('signed');
        }

        $this->entityManager->flush();
    }
}
