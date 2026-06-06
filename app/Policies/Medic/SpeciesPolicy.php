<?php

namespace App\Policies\Medic;

use App\Policies\Medic\Concerns\AuthorizesCompanyScopedRecord;
use App\Support\Administration\ModulePermissionSlugs;

class SpeciesPolicy
{
    use AuthorizesCompanyScopedRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.species')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.species')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.species')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('medic.species')->delete();
    }
}
