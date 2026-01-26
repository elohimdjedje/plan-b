<?php

namespace App\Entity;

use App\Repository\ContractRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: ContractRepository::class)]
#[ORM\Table(name: 'contracts')]
#[ORM\Index(columns: ['booking_id'], name: 'idx_contracts_booking')]
class Contract
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(targetEntity: Booking::class)]
    #[ORM\JoinColumn(nullable: false, unique: true, onDelete: 'CASCADE')]
    private ?Booking $booking = null;

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank(message: 'Le type de template est requis')]
    #[Assert\Choice(
        choices: ['furnished_rental', 'unfurnished_rental', 'seasonal_rental'],
        message: 'Type de template invalide'
    )]
    private ?string $templateType = null;

    #[ORM\Column(type: Types::JSON)]
    #[Assert\NotBlank(message: 'Les données du contrat sont requises')]
    private ?array $contractData = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $pdfUrl = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $ownerSignedAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $tenantSignedAt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $ownerSignatureUrl = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $tenantSignatureUrl = null;

    #[ORM\Column(length: 20, options: ['default' => 'draft'])]
    #[Assert\Choice(
        choices: ['draft', 'sent', 'signed', 'archived'],
        message: 'Statut invalide'
    )]
    private string $status = 'draft';

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getBooking(): ?Booking
    {
        return $this->booking;
    }

    public function setBooking(?Booking $booking): static
    {
        $this->booking = $booking;
        return $this;
    }

    public function getTemplateType(): ?string
    {
        return $this->templateType;
    }

    public function setTemplateType(string $templateType): static
    {
        $this->templateType = $templateType;
        return $this;
    }

    public function getContractData(): ?array
    {
        return $this->contractData;
    }

    public function setContractData(array $contractData): static
    {
        $this->contractData = $contractData;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getPdfUrl(): ?string
    {
        return $this->pdfUrl;
    }

    public function setPdfUrl(?string $pdfUrl): static
    {
        $this->pdfUrl = $pdfUrl;
        return $this;
    }

    public function getOwnerSignedAt(): ?\DateTimeInterface
    {
        return $this->ownerSignedAt;
    }

    public function setOwnerSignedAt(?\DateTimeInterface $ownerSignedAt): static
    {
        $this->ownerSignedAt = $ownerSignedAt;
        if ($ownerSignedAt && $this->tenantSignedAt) {
            $this->status = 'signed';
        }
        return $this;
    }

    public function getTenantSignedAt(): ?\DateTimeInterface
    {
        return $this->tenantSignedAt;
    }

    public function setTenantSignedAt(?\DateTimeInterface $tenantSignedAt): static
    {
        $this->tenantSignedAt = $tenantSignedAt;
        if ($tenantSignedAt && $this->ownerSignedAt) {
            $this->status = 'signed';
        }
        return $this;
    }

    public function getOwnerSignatureUrl(): ?string
    {
        return $this->ownerSignatureUrl;
    }

    public function setOwnerSignatureUrl(?string $ownerSignatureUrl): static
    {
        $this->ownerSignatureUrl = $ownerSignatureUrl;
        return $this;
    }

    public function getTenantSignatureUrl(): ?string
    {
        return $this->tenantSignatureUrl;
    }

    public function setTenantSignatureUrl(?string $tenantSignatureUrl): static
    {
        $this->tenantSignatureUrl = $tenantSignatureUrl;
        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        $this->updatedAt = new \DateTime();
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    /**
     * Vérifie si le contrat est signé par les deux parties
     */
    public function isFullySigned(): bool
    {
        return $this->ownerSignedAt !== null && $this->tenantSignedAt !== null;
    }

    /**
     * Vérifie si le propriétaire a signé
     */
    public function isOwnerSigned(): bool
    {
        return $this->ownerSignedAt !== null;
    }

    /**
     * Vérifie si le locataire a signé
     */
    public function isTenantSigned(): bool
    {
        return $this->tenantSignedAt !== null;
    }
}
