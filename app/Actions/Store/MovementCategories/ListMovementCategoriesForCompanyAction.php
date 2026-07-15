<?php

namespace App\Actions\Store\MovementCategories;

use App\Models\Store\MovementCategory;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListMovementCategoriesForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            MovementCategory::SORTABLE_COLUMNS,
        );

        return MovementCategory::query()
            ->forCompanyOrGlobal($companyId)
            ->withCount('inventoryMovements')
            ->search($filters['search'] ?? null)
            ->filterType($filters['type'] ?? null)
            ->filterIsActive($filters['is_active'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
