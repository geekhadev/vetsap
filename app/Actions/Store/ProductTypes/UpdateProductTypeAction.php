<?php

namespace App\Actions\Store\ProductTypes;

use App\Models\Store\ProductType;
use Illuminate\Validation\ValidationException;

final class UpdateProductTypeAction
{
    /**
     * @param  array{name: string, is_active: bool}  $data
     */
    public function execute(ProductType $productType, array $data): ProductType
    {
        $deactivating = $productType->is_active && ! $data['is_active'];

        if ($deactivating && $productType->products()->where('is_active', true)->exists()) {
            throw ValidationException::withMessages([
                'is_active' => 'No se puede desactivar este tipo porque tiene productos activos asociados.',
            ]);
        }

        $productType->update($data);

        return $productType;
    }
}
