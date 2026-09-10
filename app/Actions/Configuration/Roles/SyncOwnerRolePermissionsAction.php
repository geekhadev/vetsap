<?php

namespace App\Actions\Configuration\Roles;

use App\Models\Configuration\Role;
use App\Support\Administration\OwnerRolePermissions;
use Illuminate\Support\Facades\DB;

class SyncOwnerRolePermissionsAction
{
    /**
     * Systems whose permissions must never be granted to the Owner role.
     *
     * @var list<string>
     */
    public const EXCLUDED_SYSTEM_SLUGS = OwnerRolePermissions::EXCLUDED_SYSTEM_SLUGS;

    /**
     * Ensures the public Owner role exists. Does not overwrite permission toggles.
     *
     * @return array{role: Role, permission_count: int}
     */
    public function execute(): array
    {
        $ownerRole = OwnerRolePermissions::ensureOwnerRole();

        return [
            'role' => $ownerRole->fresh() ?? $ownerRole,
            'permission_count' => $ownerRole->permissions()->count(),
        ];
    }

    /**
     * Seed / reset helper: assigns every assignable permission to Owner.
     *
     * @return array{role: Role, permission_count: int}
     */
    public function grantAllAssignablePermissions(): array
    {
        return DB::transaction(function (): array {
            $ownerRole = OwnerRolePermissions::ensureOwnerRole();

            $permissionIds = OwnerRolePermissions::assignablePermissionsQuery()
                ->pluck('id')
                ->all();

            $ownerRole->permissions()->sync($permissionIds);

            return [
                'role' => $ownerRole->fresh() ?? $ownerRole,
                'permission_count' => count($permissionIds),
            ];
        });
    }
}
