<?php

namespace App\Actions\Store\Products;

use App\Models\Store\Product;
use Illuminate\Support\Collection;

final class SearchProductsForCompanyAction
{
    /**
     * @param  list<string>  $excludeIds
     * @return Collection<int, array{id: string, name: string, barcode: string|null, price: string, stock: int}>
     */
    public function execute(string $companyId, string $query, array $excludeIds = [], int $limit = 15): Collection
    {
        return Product::query()
            ->forCompany($companyId)
            ->where('is_active', true)
            ->search($query)
            ->when(
                $excludeIds !== [],
                static fn ($builder) => $builder->whereNotIn('id', $excludeIds),
            )
            ->orderBy('name')
            ->limit($limit)
            ->get(['id', 'name', 'barcode', 'price', 'stock'])
            ->map(static fn (Product $product): array => [
                'id' => $product->id,
                'name' => $product->name,
                'barcode' => $product->barcode,
                'price' => (string) $product->price,
                'stock' => (int) $product->stock,
            ])
            ->values();
    }
}
