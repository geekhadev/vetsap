<?php

namespace App\Actions\Agenda\AppointmentStatuses;

use App\Models\Agenda\AppointmentStatus;

final class DeleteAppointmentStatusAction
{
    public function execute(AppointmentStatus $appointmentStatus): void
    {
        $appointmentStatus->delete();
    }
}
