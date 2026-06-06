<?php

namespace App\Actions\Store\Products;

use App\Models\Store\Product;

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
        $product->update($data);

        return $product;
    }
}
