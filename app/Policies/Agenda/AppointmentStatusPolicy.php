<?php

namespace App\Policies\Agenda;

use App\Policies\Agenda\Concerns\AuthorizesAgendaMasterRecord;
use App\Support\Administration\ModulePermissionSlugs;

class AppointmentStatusPolicy
{
    use AuthorizesAgendaMasterRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('agenda.appointment-statuses')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('agenda.appointment-statuses')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('agenda.appointment-statuses')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('agenda.appointment-statuses')->delete();
    }
}
