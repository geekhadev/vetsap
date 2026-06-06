<?php

namespace App\Actions\Store\ProductCategories;

use App\Models\Store\ProductCategory;

final class CreateProductCategoryAction
{
    /**
     * @param  array{company_id: string|null, name: string, is_active: bool}  $data
     */
    public function execute(array $data): ProductCategory
    {
        return ProductCategory::query()->create($data);
    }
}
