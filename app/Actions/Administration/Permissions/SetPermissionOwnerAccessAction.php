<?php

namespace App\Actions\Administration\Permissions;

use App\Models\Administration\Permission;
use App\Support\Administration\OwnerRolePermissions;
use Illuminate\Support\Facades\DB;

class SetPermissionOwnerAccessAction
{
    public function execute(Permission $permission, bool $enabled): void
    {
        OwnerRolePermissions::assertAssignable($permission);

        DB::transaction(function () use ($permission, $enabled): void {
            $ownerRole = OwnerRolePermissions::ensureOwnerRole();

            if ($enabled) {
                $ownerRole->permissions()->syncWithoutDetaching([$permission->id]);

                return;
            }

            $ownerRole->permissions()->detach($permission->id);
        });
    }
}
