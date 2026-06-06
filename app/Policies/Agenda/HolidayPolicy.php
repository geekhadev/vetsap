<?php

namespace App\Policies\Agenda;

use App\Policies\Agenda\Concerns\AuthorizesCompanyScopedRecord;
use App\Support\Administration\ModulePermissionSlugs;

class HolidayPolicy
{
    use AuthorizesCompanyScopedRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('agenda.holidays')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('agenda.holidays')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('agenda.holidays')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('agenda.holidays')->delete();
    }
}
