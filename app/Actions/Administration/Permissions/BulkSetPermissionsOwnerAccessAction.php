<?php

namespace App\Actions\Administration\Permissions;

use App\Support\Administration\OwnerRolePermissions;
use Illuminate\Support\Facades\DB;

class BulkSetPermissionsOwnerAccessAction
{
    /**
     * @param  list<string>  $permissionIds
     * @return array{affected: int}
     */
    public function execute(array $permissionIds, bool $enabled): array
    {
        if ($permissionIds === []) {
            return ['affected' => 0];
        }

        $assignableIds = OwnerRolePermissions::assignablePermissionsQuery()
            ->whereIn('id', $permissionIds)
            ->pluck('id')
            ->all();

        if ($assignableIds === []) {
            return ['affected' => 0];
        }

        DB::transaction(function () use ($assignableIds, $enabled): void {
            $ownerRole = OwnerRolePermissions::ensureOwnerRole();

            if ($enabled) {
                $ownerRole->permissions()->syncWithoutDetaching($assignableIds);

                return;
            }

            $ownerRole->permissions()->detach($assignableIds);
        });

        return ['affected' => count($assignableIds)];
    }
}
