<?php

namespace App\Actions\Shared\States;

use App\Models\Shared\State;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListStatesAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            [...State::SORTABLE_COLUMNS, 'country'],
        );

        $query = State::query()
            ->with('country:id,name')
            ->searchName($filters['search'] ?? null)
            ->orderByColumn($sort, $direction);

        $countryId = $filters['country_id'] ?? null;
        if ($countryId !== null && $countryId !== '') {
            $query->where('country_id', (int) $countryId);
        }

        return $query
            ->paginate($perPage)
            ->withQueryString();
    }
}
