<?php

namespace App\Actions\Administration\Modules;

use App\Models\Administration\Module;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListModulesAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            Module::SORTABLE_COLUMNS,
            'created_at',
            'desc',
        );

        $query = Module::query()
            ->with(['system:id,name,slug'])
            ->searchNameOrSlug($filters['search'] ?? null)
            ->orderByColumn($sort, $direction);

        $systemId = $filters['system_id'] ?? null;
        if ($systemId !== null && $systemId !== '') {
            $query->where('system_id', (string) $systemId);
        }

        return $query
            ->paginate($perPage)
            ->withQueryString();
    }
}
