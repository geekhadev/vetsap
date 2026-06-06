<?php

namespace App\Actions\Agenda\AppointmentStatuses;

use App\Models\Agenda\AppointmentStatus;

final class CreateAppointmentStatusAction
{
    /**
     * @param  array{company_id: string, name: string, color: string, is_global: bool, is_active: bool}  $data
     */
    public function execute(array $data): AppointmentStatus
    {
        return AppointmentStatus::query()->create($data);
    }
}
