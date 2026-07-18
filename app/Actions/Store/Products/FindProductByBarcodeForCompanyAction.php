<?php

namespace App\Actions\Store\Products;

use App\Models\Store\Product;

final class FindProductByBarcodeForCompanyAction
{
    /**
     * @return array{id: string, name: string, barcode: string|null, price: string, stock: int}|null
     */
    public function execute(string $companyId, string $barcode): ?array
    {
        $normalized = mb_strtolower(trim($barcode));

        if ($normalized === '') {
            return null;
        }

        $product = Product::query()
            ->forCompany($companyId)
            ->where('is_active', true)
            ->whereRaw('LOWER(barcode) = ?', [$normalized])
            ->first(['id', 'name', 'barcode', 'price', 'stock']);

        if (! $product instanceof Product) {
            return null;
        }

        return [
            'id' => $product->id,
            'name' => $product->name,
            'barcode' => $product->barcode,
            'price' => (string) $product->price,
            'stock' => (int) $product->stock,
        ];
    }
}
