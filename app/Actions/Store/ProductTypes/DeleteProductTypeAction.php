<?php

namespace App\Actions\Store\ProductTypes;

use App\Models\Store\ProductType;
use Illuminate\Validation\ValidationException;

final class DeleteProductTypeAction
{
    public function execute(ProductType $productType): void
    {
        if ($productType->products()->exists()) {
            throw ValidationException::withMessages([
                'name' => 'No se puede eliminar este tipo porque tiene productos asociados.',
            ]);
        }

        $productType->delete();
    }
}
