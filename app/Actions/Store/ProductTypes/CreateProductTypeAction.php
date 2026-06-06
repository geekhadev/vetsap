<?php

namespace App\Actions\Store\ProductTypes;

use App\Models\Store\ProductType;

final class CreateProductTypeAction
{
    /**
     * @param  array{company_id: string|null, name: string, is_active: bool}  $data
     */
    public function execute(array $data): ProductType
    {
        return ProductType::query()->create($data);
    }
}
