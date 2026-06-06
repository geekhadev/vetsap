<?php

namespace App\Actions\Agenda\Appointments;

use App\Enums\Agenda\AppointmentSource;
use App\Models\Agenda\Appointment;
use App\Models\Agenda\AppointmentStatusLog;
use App\Models\User;
use Illuminate\Support\Carbon;

final class RecordAppointmentStatusChangeAction
{
    /**
     * @param  array<string, mixed>|null  $metadata
     */
    public function execute(
        Appointment $appointment,
        ?string $fromAppointmentStatusId,
        string $toAppointmentStatusId,
        AppointmentSource $source,
        ?User $changedByUser = null,
        ?string $notes = null,
        ?array $metadata = null,
        ?Carbon $occurredAt = null,
    ): AppointmentStatusLog {
        $occurredAt ??= now();

        $log = AppointmentStatusLog::query()->create([
            'appointment_id' => $appointment->id,
            'from_appointment_status_id' => $fromAppointmentStatusId,
            'to_appointment_status_id' => $toAppointmentStatusId,
            'changed_by_user_id' => $changedByUser?->id,
            'source' => $source,
            'notes' => $notes,
            'metadata' => $metadata,
            'occurred_at' => $occurredAt,
        ]);

        $appointment->update([
            'appointment_status_id' => $toAppointmentStatusId,
            'status_changed_at' => $occurredAt,
            'status_changed_by_user_id' => $changedByUser?->id,
        ]);

        return $log;
    }
}
