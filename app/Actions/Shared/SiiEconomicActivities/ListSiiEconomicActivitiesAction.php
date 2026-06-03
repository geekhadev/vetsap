<?php

namespace App\Actions\Shared\SiiEconomicActivities;

use App\Models\Shared\SiiEconomicActivity;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListSiiEconomicActivitiesAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(array $filters): LengthAwarePaginator
    {
        $sort = in_array($filters['sort'], SiiEconomicActivity::SORTABLE_COLUMNS, true)
            ? $filters['sort']
            : 'code';
        $direction = ($filters['direction'] ?? 'asc') === 'asc' ? 'asc' : 'desc';
        $perPage = (int) ($filters['per_page'] ?? 20);

        return SiiEconomicActivity::query()
            ->searchFields($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
