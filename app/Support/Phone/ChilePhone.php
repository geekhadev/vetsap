<?php

namespace App\Support\Phone;

final class ChilePhone
{
    public static function normalize(?string $phone): string
    {
        if ($phone === null || $phone === '') {
            return '';
        }

        $digits = preg_replace('/\D+/', '', $phone) ?? '';

        if ($digits === '') {
            return '';
        }

        if (str_starts_with($digits, '56') && strlen($digits) > 9) {
            $digits = substr($digits, 2);
        }

        return substr($digits, -9);
    }

    public static function isValid(?string $phone): bool
    {
        $normalized = self::normalize($phone);

        return strlen($normalized) === 9 && $normalized[0] === '9';
    }
}
