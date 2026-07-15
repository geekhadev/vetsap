<?php

namespace App\Actions\Store\MovementCategories;

use App\Models\Store\MovementCategory;
use Illuminate\Validation\ValidationException;

final class DeleteMovementCategoryAction
{
    public function execute(MovementCategory $movementCategory): void
    {
        if ($movementCategory->inventoryMovements()->exists()) {
            throw ValidationException::withMessages([
                'name' => 'No se puede eliminar esta categoría porque tiene movimientos asociados.',
            ]);
        }

        if ($movementCategory->company_id === null) {
            throw ValidationException::withMessages([
                'name' => 'No se puede eliminar una categoría de movimiento global del sistema.',
            ]);
        }

        $movementCategory->delete();
    }
}
