<?php

namespace App\Actions\Agenda\Appointments;

use App\Enums\Agenda\AppointmentSource;
use App\Models\Agenda\Appointment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class ChangeAppointmentStatusAction
{
    public function __construct(
        private RecordAppointmentStatusChangeAction $recordStatusChange,
    ) {}

    public function execute(
        Appointment $appointment,
        string $toAppointmentStatusId,
        User $user,
        ?string $notes = null,
        AppointmentSource $source = AppointmentSource::Internal,
    ): Appointment {
        $fromAppointmentStatusId = $appointment->appointment_status_id;

        if ($fromAppointmentStatusId === $toAppointmentStatusId) {
            throw ValidationException::withMessages([
                'appointment_status_id' => 'La cita ya tiene ese estado.',
            ]);
        }

        return DB::transaction(function () use (
            $appointment,
            $fromAppointmentStatusId,
            $toAppointmentStatusId,
            $user,
            $notes,
            $source,
        ): Appointment {
            $this->recordStatusChange->execute(
                $appointment,
                $fromAppointmentStatusId,
                $toAppointmentStatusId,
                $source,
                $user,
                $notes,
            );

            return $appointment->refresh();
        });
    }
}
