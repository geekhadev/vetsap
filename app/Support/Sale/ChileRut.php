<?php

namespace App\Support\Sale;

final class ChileRut
{
    /**
     * Normaliza un RUT chileno para comparación (sin puntos, DV en mayúsculas).
     */
    public static function normalize(string $rut): string
    {
        $rut = trim($rut);
        $rut = str_replace('.', '', $rut);

        return strtoupper($rut);
    }
}
