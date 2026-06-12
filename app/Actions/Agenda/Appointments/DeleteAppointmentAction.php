<?php

namespace App\Actions\Agenda\Appointments;

use App\Models\Agenda\Appointment;

final class DeleteAppointmentAction
{
    public function execute(Appointment $appointment): void
    {
        $appointment->delete();
    }
}
