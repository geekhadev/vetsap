<?php

namespace App\Actions\Purchase\PurchaseOrderStatuses;

use App\Models\Purchase\PurchaseOrderStatus;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListPurchaseOrderStatusesForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            PurchaseOrderStatus::SORTABLE_COLUMNS,
        );

        return PurchaseOrderStatus::query()
            ->forCompanyOrGlobal($companyId)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
