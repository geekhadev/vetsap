<?php

namespace App\Policies\Medic;

use App\Policies\Medic\Concerns\AuthorizesCompanyScopedRecord;
use App\Support\Administration\ModulePermissionSlugs;

class ServicesPolicy
{
    use AuthorizesCompanyScopedRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.services')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.services')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.services')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.services')->delete();
    }
}
