<?php

namespace App\Support\Phone;

final class WhatsappPhone
{
    public static function internationalDigits(?string $phone): ?string
    {
        if ($phone === null || $phone === '') {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $phone) ?? '';

        if ($digits === '') {
            return null;
        }

        if (str_starts_with($digits, '56') && strlen($digits) >= 11) {
            return $digits;
        }

        $local = substr($digits, -9);

        if (strlen($local) === 9) {
            return '56'.$local;
        }

        return strlen($digits) >= 8 ? $digits : null;
    }

    public static function chatUrl(string $internationalDigits, string $message): string
    {
        return 'https://wa.me/'.$internationalDigits.'?text='.rawurlencode($message);
    }
}
