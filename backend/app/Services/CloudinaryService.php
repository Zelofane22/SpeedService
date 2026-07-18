<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use RuntimeException;

/**
 * Encapsule tous les échanges avec Cloudinary (upload, URL signée, suppression).
 *
 * Les documents et pièces d'identité livreur sont téléversés en mode « authenticated » :
 * ils ne sont jamais accessibles publiquement. La consultation se fait exclusivement
 * via une URL de téléchargement signée et à durée limitée (voir signedUrl()).
 */
class CloudinaryService
{
    private ?Cloudinary $client = null;

    /**
     * Téléverse un fichier privé (authenticated) et renvoie ses métadonnées de stockage.
     *
     * @return array{public_id:string,resource_type:string,format:?string,secure_url:string,bytes:int}
     */
    public function uploadPrivate(UploadedFile $file, string $folder): array
    {
        $result = $this->client()->uploadApi()->upload($file->getRealPath(), [
            'folder'          => $this->rootFolder() . '/' . trim($folder, '/'),
            'type'            => 'authenticated',
            'resource_type'   => 'auto',
            'use_filename'    => true,
            'unique_filename' => true,
            'overwrite'       => false,
        ]);

        return [
            'public_id'     => (string) $result['public_id'],
            'resource_type' => (string) $result['resource_type'],
            'format'        => isset($result['format']) ? (string) $result['format'] : null,
            'secure_url'    => (string) $result['secure_url'],
            'bytes'         => (int) ($result['bytes'] ?? 0),
        ];
    }

    /**
     * Génère une URL de téléchargement signée et à durée limitée pour un asset privé.
     *
     * @param bool $attachment true = force le téléchargement, false = affichage inline
     */
    public function signedUrl(
        string $publicId,
        string $resourceType,
        ?string $format = null,
        ?int $ttl = null,
        bool $attachment = true,
    ): string {
        $ttl = $ttl ?? (int) config('services.cloudinary.signed_url_ttl', 300);

        return $this->client()->uploadApi()->privateDownloadUrl(
            $publicId,
            (string) $format,
            [
                'resource_type' => $resourceType,
                'type'          => 'authenticated',
                'expires_at'    => now()->addSeconds($ttl)->timestamp,
                'attachment'    => $attachment,
            ],
        );
    }

    /**
     * Supprime définitivement un asset (par ex. lors d'un remplacement de document).
     */
    public function delete(string $publicId, string $resourceType = 'image'): void
    {
        $this->client()->uploadApi()->destroy($publicId, [
            'resource_type' => $resourceType,
            'type'          => 'authenticated',
            'invalidate'    => true,
        ]);
    }

    private function rootFolder(): string
    {
        return trim((string) config('services.cloudinary.folder', 'speedservice'), '/');
    }

    private function client(): Cloudinary
    {
        if ($this->client instanceof Cloudinary) {
            return $this->client;
        }

        $config = config('services.cloudinary');

        if (empty($config['cloud_name']) || empty($config['api_key']) || empty($config['api_secret'])) {
            throw new RuntimeException(
                'Configuration Cloudinary manquante : renseignez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET.'
            );
        }

        return $this->client = new Cloudinary([
            'cloud' => [
                'cloud_name' => $config['cloud_name'],
                'api_key'    => $config['api_key'],
                'api_secret' => $config['api_secret'],
            ],
            'url' => [
                'secure' => (bool) ($config['secure'] ?? true),
            ],
        ]);
    }
}
