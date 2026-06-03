<?php

namespace App\Actions\Configuration\Roles;

use App\Exceptions\RoleHasUsersException;
use App\Models\Configuration\Role;
use App\Models\UserCompanyRole;

class DeleteRoleAction
{
    public function execute(Role $role): void
    {
        $assignedCount = UserCompanyRole::query()
            ->where('role_id', $role->id)
            ->count();

        if ($assignedCount > 0) {
            throw RoleHasUsersException::forRole($assignedCount);
        }

        $role->delete();
    }
}
