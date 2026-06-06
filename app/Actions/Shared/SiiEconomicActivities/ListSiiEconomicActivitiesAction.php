<?php

namespace App\Actions\Shared\SiiEconomicActivities;

use App\Models\Shared\SiiEconomicActivity;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListSiiEconomicActivitiesAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            SiiEconomicActivity::SORTABLE_COLUMNS,
            'code',
            'asc',
        );

        return SiiEconomicActivity::query()
            ->searchFields($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
