<?php

namespace App\Actions\Configuration\Roles;

use App\Models\Administration\Permission;
use App\Models\Configuration\Role;
use Illuminate\Support\Facades\DB;

class SyncOwnerRolePermissionsAction
{
    /**
     * Systems whose permissions must never be granted to the Owner role.
     *
     * @var list<string>
     */
    public const EXCLUDED_SYSTEM_SLUGS = [
        'administration',
        'shared',
    ];

    /**
     * Ensures the public Owner role exists and syncs every permission
     * except those belonging to Administración and Compartido.
     *
     * @return array{role: Role, permission_count: int}
     */
    public function execute(): array
    {
        return DB::transaction(function (): array {
            $ownerRole = Role::query()->firstOrCreate(
                [
                    'name' => Role::OWNER_SYSTEM_NAME,
                    'is_public' => true,
                    'company_id' => null,
                ],
            );

            $permissionIds = Permission::query()
                ->whereHas('module.system', function ($query): void {
                    $query->whereNotIn('slug', self::EXCLUDED_SYSTEM_SLUGS);
                })
                ->pluck('id')
                ->all();

            $ownerRole->permissions()->sync($permissionIds);

            return [
                'role' => $ownerRole->fresh(),
                'permission_count' => count($permissionIds),
            ];
        });
    }
}
