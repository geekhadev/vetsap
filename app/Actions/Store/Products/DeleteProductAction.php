<?php

namespace App\Actions\Store\Products;

use App\Models\Store\Product;

final class DeleteProductAction
{
    public function execute(Product $product): void
    {
        $product->delete();
    }
}
