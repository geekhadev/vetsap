<?php

namespace App\Actions\Agenda\Holidays;

use App\Models\Agenda\Holiday;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListHolidaysForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            Holiday::SORTABLE_COLUMNS,
        );

        return Holiday::query()
            ->forCompany($companyId)
            ->filterIsActive($filters['is_active'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
