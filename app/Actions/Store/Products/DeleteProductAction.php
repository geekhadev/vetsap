<?php

namespace App\Actions\Store\Products;

use App\Models\Store\Product;
use Illuminate\Validation\ValidationException;

final class DeleteProductAction
{
    public function execute(Product $product): void
    {
        if ($product->inventoryMovementDetails()->exists()) {
            throw ValidationException::withMessages([
                'name' => 'No se puede eliminar este producto porque tiene movimientos de inventario asociados.',
            ]);
        }

        $product->delete();
    }
}
