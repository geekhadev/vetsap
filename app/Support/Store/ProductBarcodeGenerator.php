<?php

namespace App\Support\Store;

use App\Models\Store\Product;

final class ProductBarcodeGenerator
{
    public static function isBlank(?string $barcode): bool
    {
        return $barcode === null || trim($barcode) === '';
    }

    /**
     * Genera un código de barras interno numérico único para la empresa.
     * Usa el rango 2… (códigos internos de tienda, 13 dígitos).
     */
    public static function uniqueForCompany(string $companyId, ?string $ignoreProductId = null): string
    {
        do {
            $barcode = (string) random_int(2_000_000_000_000, 2_999_999_999_999);
        } while (
            Product::query()
                ->where('company_id', $companyId)
                ->where('barcode', $barcode)
                ->when(
                    $ignoreProductId !== null && $ignoreProductId !== '',
                    fn ($query) => $query->whereKeyNot($ignoreProductId),
                )
                ->exists()
        );

        return $barcode;
    }
}
