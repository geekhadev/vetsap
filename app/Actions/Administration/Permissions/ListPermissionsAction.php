<?php

namespace App\Actions\Administration\Permissions;

use App\Models\Administration\Permission;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListPermissionsAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            Permission::SORTABLE_COLUMNS,
            'created_at',
            'desc',
        );

        $query = Permission::query()
            ->with([
                'module:id,name,slug,system_id',
                'module.system:id,name,slug',
            ])
            ->searchNameOrSlug($filters['search'] ?? null)
            ->orderByColumn($sort, $direction);

        $moduleId = $filters['module_id'] ?? null;
        if ($moduleId !== null && $moduleId !== '') {
            $query->where('module_id', (string) $moduleId);
        } else {
            $systemId = $filters['system_id'] ?? null;
            if ($systemId !== null && $systemId !== '') {
                $query->whereHas('module', function ($q) use ($systemId): void {
                    $q->where('system_id', (string) $systemId);
                });
            }
        }

        return $query
            ->paginate($perPage)
            ->withQueryString();
    }
}
