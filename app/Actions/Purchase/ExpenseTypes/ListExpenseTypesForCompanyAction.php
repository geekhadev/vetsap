<?php

namespace App\Actions\Purchase\ExpenseTypes;

use App\Models\Purchase\ExpenseType;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListExpenseTypesForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            ExpenseType::SORTABLE_COLUMNS,
        );

        return ExpenseType::query()
            ->forCompanyOrGlobal($companyId)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
