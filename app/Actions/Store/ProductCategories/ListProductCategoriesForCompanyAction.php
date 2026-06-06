<?php

namespace App\Actions\Store\ProductCategories;

use App\Models\Store\ProductCategory;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListProductCategoriesForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            ProductCategory::SORTABLE_COLUMNS,
        );

        return ProductCategory::query()
            ->forCompanyOrGlobal($companyId)
            ->withCount([
                'products as active_products_count' => function ($query): void {
                    $query->where('is_active', true);
                },
            ])
            ->search($filters['search'] ?? null)
            ->filterIsActive($filters['is_active'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
