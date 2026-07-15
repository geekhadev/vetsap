<?php

namespace App\Actions\Store\InventoryMovements;

use App\Models\Store\InventoryMovement;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListInventoryMovementsForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            InventoryMovement::SORTABLE_COLUMNS,
            defaultSort: 'moved_at',
            defaultDirection: 'desc',
        );

        return InventoryMovement::query()
            ->forCompany($companyId)
            ->with([
                'movementCategory:id,name,type',
            ])
            ->search($filters['search'] ?? null)
            ->filterType($filters['type'] ?? null)
            ->filterMovementCategoryId($filters['movement_category_id'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
