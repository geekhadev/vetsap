<?php

namespace App\Actions\Medic\Species;

use App\Models\Medic\Species;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListSpeciesForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            Species::SORTABLE_COLUMNS,
        );

        return Species::query()
            ->forCompanyOrGlobal($companyId)
            ->filterIsActive($filters['is_active'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
