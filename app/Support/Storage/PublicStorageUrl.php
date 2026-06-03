<?php

namespace App\Support\Storage;

/**
 * URLs públicas del disco `public` (`storage/app/public` → `/storage/...`).
 */
final class PublicStorageUrl
{
    public static function fromRelativePath(?string $relativePath): ?string
    {
        if ($relativePath === null || $relativePath === '') {
            return null;
        }

        return '/storage/'.ltrim($relativePath, '/');
    }
}
