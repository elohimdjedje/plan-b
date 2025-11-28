<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class ImageUploadService
{
    private ?string $cloudinaryCloudName;
    private ?string $cloudinaryApiKey;
    private ?string $cloudinaryApiSecret;
    private string $uploadDir;

    public function __construct(ParameterBagInterface $params)
    {
        // Configuration Cloudinary (optionnel)
        $this->cloudinaryCloudName = $_ENV['CLOUDINARY_CLOUD_NAME'] ?? null;
        $this->cloudinaryApiKey = $_ENV['CLOUDINARY_API_KEY'] ?? null;
        $this->cloudinaryApiSecret = $_ENV['CLOUDINARY_API_SECRET'] ?? null;

        // Dossier local de fallback
        $this->uploadDir = $params->get('kernel.project_dir') . '/public/uploads/images';
        
        // Créer le dossier si nécessaire
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    /**
     * Upload une image (Cloudinary ou local)
     * 
     * @param UploadedFile $file Fichier uploadé
     * @param string $folder Dossier de destination (ex: 'listings', 'profiles')
     * @return array ['url', 'thumbnail_url', 'key']
     */
    public function uploadImage(UploadedFile $file, string $folder = 'listings'): array
    {
        // Validation du fichier
        $this->validateImage($file);

        // Si Cloudinary est configuré, utiliser Cloudinary
        if ($this->cloudinaryCloudName && $this->cloudinaryApiKey && $this->cloudinaryApiSecret) {
            return $this->uploadToCloudinary($file, $folder);
        }

        // Sinon, upload local
        return $this->uploadLocal($file, $folder);
    }

    /**
     * Upload vers Cloudinary
     */
    private function uploadToCloudinary(UploadedFile $file, string $folder): array
    {
        $timestamp = time();
        $publicId = $folder . '/' . uniqid() . '_' . $timestamp;

        // Paramètres de l'upload
        $params = [
            'file' => new \CURLFile($file->getPathname()),
            'upload_preset' => 'planb_preset', // À créer dans Cloudinary
            'folder' => $folder,
            'public_id' => $publicId,
            'timestamp' => $timestamp,
            'api_key' => $this->cloudinaryApiKey,
        ];

        // Signature
        $signature = $this->generateCloudinarySignature($params);
        $params['signature'] = $signature;

        // Upload via cURL
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/{$this->cloudinaryCloudName}/image/upload");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new \Exception('Erreur upload Cloudinary: ' . $response);
        }

        $result = json_decode($response, true);

        return [
            'url' => $result['secure_url'],
            'thumbnail_url' => $this->getCloudinaryThumbnail($result['public_id']),
            'key' => $result['public_id']
        ];
    }

    /**
     * Upload local (fallback)
     */
    private function uploadLocal(UploadedFile $file, string $folder): array
    {
        $filename = uniqid() . '_' . time() . '.' . $file->guessExtension();
        $subDir = $this->uploadDir . '/' . $folder;

        if (!is_dir($subDir)) {
            mkdir($subDir, 0755, true);
        }

        $file->move($subDir, $filename);

        // Créer une miniature
        $thumbnailPath = $this->createThumbnail($subDir . '/' . $filename, 300, 300);

        return [
            'url' => '/uploads/images/' . $folder . '/' . $filename,
            'thumbnail_url' => '/uploads/images/' . $folder . '/thumb_' . $filename,
            'key' => $folder . '/' . $filename
        ];
    }

    /**
     * Valider l'image
     */
    private function validateImage(UploadedFile $file): void
    {
        // Taille max: 5 MB
        $maxSize = 5 * 1024 * 1024;
        if ($file->getSize() > $maxSize) {
            throw new \Exception('Image trop volumineuse (max 5 MB)');
        }

        // Types autorisés
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!in_array($file->getMimeType(), $allowedMimes)) {
            throw new \Exception('Format d\'image non autorisé (JPG, PNG, WebP, GIF uniquement)');
        }
    }

    /**
     * Créer une miniature locale
     */
    private function createThumbnail(string $imagePath, int $width, int $height): string
    {
        $info = getimagesize($imagePath);
        $mime = $info['mime'];

        // Créer l'image source
        switch ($mime) {
            case 'image/jpeg':
                $source = imagecreatefromjpeg($imagePath);
                break;
            case 'image/png':
                $source = imagecreatefrompng($imagePath);
                break;
            case 'image/webp':
                $source = imagecreatefromwebp($imagePath);
                break;
            case 'image/gif':
                $source = imagecreatefromgif($imagePath);
                break;
            default:
                throw new \Exception('Type d\'image non supporté pour miniature');
        }

        $srcWidth = imagesx($source);
        $srcHeight = imagesy($source);

        // Calculer les dimensions
        $ratio = min($width / $srcWidth, $height / $srcHeight);
        $newWidth = (int)($srcWidth * $ratio);
        $newHeight = (int)($srcHeight * $ratio);

        // Créer la miniature
        $thumb = imagecreatetruecolor($newWidth, $newHeight);
        imagecopyresampled($thumb, $source, 0, 0, 0, 0, $newWidth, $newHeight, $srcWidth, $srcHeight);

        // Sauvegarder
        $thumbPath = dirname($imagePath) . '/thumb_' . basename($imagePath);
        imagejpeg($thumb, $thumbPath, 85);

        imagedestroy($source);
        imagedestroy($thumb);

        return $thumbPath;
    }

    /**
     * Générer signature Cloudinary
     */
    private function generateCloudinarySignature(array $params): string
    {
        unset($params['file']);
        unset($params['api_key']);
        ksort($params);

        $stringToSign = '';
        foreach ($params as $key => $value) {
            $stringToSign .= $key . '=' . $value . '&';
        }
        $stringToSign = rtrim($stringToSign, '&');
        $stringToSign .= $this->cloudinaryApiSecret;

        return sha1($stringToSign);
    }

    /**
     * Obtenir URL miniature Cloudinary
     */
    private function getCloudinaryThumbnail(string $publicId): string
    {
        return "https://res.cloudinary.com/{$this->cloudinaryCloudName}/image/upload/w_300,h_300,c_fill/{$publicId}";
    }

    /**
     * Supprimer une image (Cloudinary ou local)
     */
    public function deleteImage(string $key): bool
    {
        if ($this->cloudinaryCloudName && strpos($key, '/') !== false) {
            // Supprimer de Cloudinary
            return $this->deleteFromCloudinary($key);
        }

        // Supprimer en local
        $filePath = $this->uploadDir . '/' . $key;
        if (file_exists($filePath)) {
            unlink($filePath);
            
            // Supprimer aussi la miniature
            $thumbPath = dirname($filePath) . '/thumb_' . basename($filePath);
            if (file_exists($thumbPath)) {
                unlink($thumbPath);
            }
            
            return true;
        }

        return false;
    }

    /**
     * Supprimer de Cloudinary
     */
    private function deleteFromCloudinary(string $publicId): bool
    {
        $timestamp = time();
        
        $params = [
            'public_id' => $publicId,
            'timestamp' => $timestamp,
            'api_key' => $this->cloudinaryApiKey,
        ];

        $signature = $this->generateCloudinarySignature($params);
        $params['signature'] = $signature;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/{$this->cloudinaryCloudName}/image/destroy");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return $httpCode === 200;
    }
}
