<?php

namespace App\Policies\Medic;

use App\Policies\Medic\Concerns\AuthorizesCompanyScopedRecord;
use App\Support\Administration\ModulePermissionSlugs;

class DoctorsPolicy
{
    use AuthorizesCompanyScopedRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.doctors')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.doctors')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.doctors')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.doctors')->delete();
    }
}
