<?php

namespace App\Actions\Store\InventoryMovements;

use App\Enums\Store\InventoryMovementType;
use App\Models\Store\MovementCategory;
use Illuminate\Database\Eloquent\ModelNotFoundException;

final class ResolveGlobalMovementCategoryAction
{
    public function execute(InventoryMovementType $type, string $name): MovementCategory
    {
        $category = MovementCategory::query()
            ->whereNull('company_id')
            ->where('type', $type)
            ->where('name', $name)
            ->where('is_active', true)
            ->first();

        if (! $category instanceof MovementCategory) {
            throw (new ModelNotFoundException)->setModel(MovementCategory::class, [$name]);
        }

        return $category;
    }
}
