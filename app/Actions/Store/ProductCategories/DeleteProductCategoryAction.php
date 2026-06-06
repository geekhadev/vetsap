<?php

namespace App\Actions\Store\ProductCategories;

use App\Models\Store\ProductCategory;
use Illuminate\Validation\ValidationException;

final class DeleteProductCategoryAction
{
    public function execute(ProductCategory $productCategory): void
    {
        if ($productCategory->products()->exists()) {
            throw ValidationException::withMessages([
                'name' => 'No se puede eliminar esta categoría porque tiene productos asociados.',
            ]);
        }

        $productCategory->delete();
    }
}
