<?php

namespace App\Actions\Administration\Permissions;

use App\Models\Administration\Permission;
use App\Models\Configuration\Role;
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

        $ownerRoleId = Role::query()->systemOwner()->value('id');

        $query = Permission::query()
            ->with([
                'module:id,name,slug,system_id',
                'module.system:id,name,slug',
            ])
            ->searchNameOrSlug($filters['search'] ?? null)
            ->orderByColumn($sort, $direction);

        if (is_string($ownerRoleId) && $ownerRoleId !== '') {
            $query->withExists([
                'roles as owner_enabled' => function ($rolesQuery) use ($ownerRoleId): void {
                    $rolesQuery->where('configuration_roles.id', $ownerRoleId);
                },
            ]);
        }

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

        $paginator = $query
            ->paginate($perPage)
            ->withQueryString();

        if (is_string($ownerRoleId) && $ownerRoleId !== '') {
            $paginator->getCollection()->transform(function (Permission $permission): Permission {
                $permission->setAttribute(
                    'owner_enabled',
                    (bool) $permission->getAttribute('owner_enabled'),
                );

                return $permission;
            });
        } else {
            $paginator->getCollection()->transform(function (Permission $permission): Permission {
                $permission->setAttribute('owner_enabled', false);

                return $permission;
            });
        }

        return $paginator;
    }
}
