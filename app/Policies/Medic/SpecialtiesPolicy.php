<?php

namespace App\Policies\Medic;

use App\Policies\Medic\Concerns\AuthorizesCompanyScopedRecord;
use App\Support\Administration\ModulePermissionSlugs;

class SpecialtiesPolicy
{
    use AuthorizesCompanyScopedRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.specialties')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.specialties')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.specialties')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.specialties')->delete();
    }
}
