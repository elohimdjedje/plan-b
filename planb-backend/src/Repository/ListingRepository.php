<?php

namespace App\Repository;

use App\Entity\Listing;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ListingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Listing::class);
    }

    public function findActiveListings(int $limit = 20, ?string $lastId = null): array
    {
        $qb = $this->createQueryBuilder('l')
            ->leftJoin('l.owner', 'owner')
            ->leftJoin('l.images', 'images')
            ->addSelect('owner', 'images')
            ->where('l.status = :status')
            ->andWhere('l.expiresAt > :now')
            ->setParameter('status', 'active')
            ->setParameter('now', new \DateTime())
            ->orderBy('l.createdAt', 'DESC')
            ->setMaxResults($limit);

        if ($lastId) {
            $qb->andWhere('l.id < :lastId')
                ->setParameter('lastId', $lastId);
        }

        return $qb->getQuery()->getResult();
    }

    public function searchListings(array $filters, int $limit = 20): array
    {
        $qb = $this->createQueryBuilder('l')
            ->leftJoin('l.owner', 'owner')
            ->leftJoin('l.images', 'images')
            ->addSelect('owner', 'images')
            ->where('l.status = :status')
            ->setParameter('status', 'active');

        // Recherche par mot-clé dans le titre et la description
        if (isset($filters['search']) && !empty($filters['search'])) {
            $qb->andWhere('l.title LIKE :search OR l.description LIKE :search')
                ->setParameter('search', '%' . $filters['search'] . '%');
        }

        if (isset($filters['category'])) {
            $qb->andWhere('l.category = :category')
                ->setParameter('category', $filters['category']);
        }

        if (isset($filters['subcategory'])) {
            $qb->andWhere('l.subcategory = :subcategory')
                ->setParameter('subcategory', $filters['subcategory']);
        }

        if (isset($filters['type'])) {
            $qb->andWhere('l.type = :type')
                ->setParameter('type', $filters['type']);
        }

        if (isset($filters['country'])) {
            $qb->andWhere('l.country = :country')
                ->setParameter('country', $filters['country']);
        }

        if (isset($filters['city'])) {
            $qb->andWhere('l.city = :city')
                ->setParameter('city', $filters['city']);
        }

        if (isset($filters['priceMin'])) {
            $qb->andWhere('l.price >= :priceMin')
                ->setParameter('priceMin', $filters['priceMin']);
        }

        if (isset($filters['priceMax'])) {
            $qb->andWhere('l.price <= :priceMax')
                ->setParameter('priceMax', $filters['priceMax']);
        }

        return $qb->orderBy('l.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
