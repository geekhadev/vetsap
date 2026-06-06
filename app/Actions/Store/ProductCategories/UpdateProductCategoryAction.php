<?php

namespace App\Actions\Store\ProductCategories;

use App\Models\Store\ProductCategory;

final class UpdateProductCategoryAction
{
    /**
     * @param  array{name: string, is_active: bool}  $data
     */
    public function execute(ProductCategory $productCategory, array $data): ProductCategory
    {
        $productCategory->update($data);

        return $productCategory;
    }
}
