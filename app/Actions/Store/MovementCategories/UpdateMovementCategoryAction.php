<?php

namespace App\Actions\Store\MovementCategories;

use App\Enums\Store\InventoryMovementType;
use App\Models\Store\MovementCategory;
use Illuminate\Validation\ValidationException;

final class UpdateMovementCategoryAction
{
    /**
     * @param  array{name: string, type: string, is_active: bool}  $data
     */
    public function execute(MovementCategory $movementCategory, array $data): MovementCategory
    {
        $nextType = InventoryMovementType::from($data['type']);

        if (
            $movementCategory->type !== $nextType
            && $movementCategory->inventoryMovements()->exists()
        ) {
            throw ValidationException::withMessages([
                'type' => 'No se puede cambiar el tipo porque la categoría tiene movimientos asociados.',
            ]);
        }

        $movementCategory->update($data);

        return $movementCategory;
    }
}
