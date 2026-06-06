<?php

namespace App\Actions\Agenda\AppointmentStatuses;

use App\Models\Agenda\AppointmentStatus;

final class UpdateAppointmentStatusAction
{
    /**
     * @param  array{name: string, color: string, is_active: bool}  $data
     */
    public function execute(AppointmentStatus $appointmentStatus, array $data): AppointmentStatus
    {
        $appointmentStatus->update($data);

        return $appointmentStatus;
    }
}
