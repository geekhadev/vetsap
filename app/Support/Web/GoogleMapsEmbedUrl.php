<?php

namespace App\Support\Web;

/**
 * Normaliza el valor de ubicación de Google Maps: acepta la URL embed
 * o el HTML completo del iframe que copia Google Maps (“Insertar un mapa”).
 */
final class GoogleMapsEmbedUrl
{
    public static function normalize(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        if ($trimmed === '') {
            return null;
        }

        if (preg_match('/<iframe\b[^>]*\bsrc\s*=\s*(["\'])(.*?)\1/is', $trimmed, $matches) === 1) {
            $trimmed = html_entity_decode($matches[2], ENT_QUOTES | ENT_HTML5);
        }

        $trimmed = trim($trimmed);

        return $trimmed === '' ? null : $trimmed;
    }
}
