<?php

namespace App\Actions\Store\MovementCategories;

use App\Models\Store\MovementCategory;

final class CreateMovementCategoryAction
{
    /**
     * @param  array{company_id: string|null, name: string, type: string, is_active: bool}  $data
     */
    public function execute(array $data): MovementCategory
    {
        return MovementCategory::query()->create($data);
    }
}
