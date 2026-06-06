<?php

namespace App\Actions\Store\ProductTypes;

use App\Models\Store\ProductType;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListProductTypesForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            ProductType::SORTABLE_COLUMNS,
        );

        return ProductType::query()
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
