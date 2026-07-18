<?php

namespace App\Actions\Store\Products;

use App\Models\Store\Product;
use App\Support\Store\ProductBarcodeGenerator;

final class UpdateProductAction
{
    /**
     * @param  array{
     *     product_category_id: string,
     *     product_type_id: string,
     *     name: string,
     *     barcode: string|null,
     *     description: string|null,
     *     price: string|null,
     *     is_active: bool
     * }  $data
     */
    public function execute(Product $product, array $data): Product
    {
        if (ProductBarcodeGenerator::isBlank($data['barcode'] ?? null)) {
            $data['barcode'] = ProductBarcodeGenerator::uniqueForCompany(
                $product->company_id,
                $product->id,
            );
        }

        $product->update($data);

        return $product;
    }
}
