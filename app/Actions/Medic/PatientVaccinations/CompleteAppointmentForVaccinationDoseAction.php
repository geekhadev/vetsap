<?php

namespace App\Actions\Medic\PatientVaccinations;

use App\Actions\Agenda\Appointments\RecordAppointmentStatusChangeAction;
use App\Enums\Agenda\AppointmentSource;
use App\Enums\Medic\VaccinationDoseStatus;
use App\Models\Agenda\Appointment;
use App\Models\Medic\PatientVaccinationDose;
use App\Models\User;
use App\Support\Validation\AppointmentPayloadValidationRules;

/**
 * Cierra la cita ligada a vacunación cuando ya no quedan dosis abiertas.
 * No crea atención clínica ni líneas de servicio.
 */
final class CompleteAppointmentForVaccinationDoseAction
{
    public function __construct(
        private RecordAppointmentStatusChangeAction $recordStatusChange,
    ) {}

    public function execute(PatientVaccinationDose $dose, ?string $userId = null): void
    {
        $dose->loadMissing(['appointment.appointmentStatus:id,is_terminal']);

        $appointment = $dose->appointment;

        if (! $appointment instanceof Appointment) {
            return;
        }

        if ($appointment->appointmentStatus?->is_terminal) {
            return;
        }

        $hasOpenDoses = PatientVaccinationDose::query()
            ->where('appointment_id', $appointment->id)
            ->whereIn('status', [
                VaccinationDoseStatus::Scheduled,
                VaccinationDoseStatus::Due,
                VaccinationDoseStatus::Overdue,
            ])
            ->exists();

        if ($hasOpenDoses) {
            return;
        }

        $attendedStatusId = AppointmentPayloadValidationRules::defaultAttendedStatusId();
        $user = is_string($userId) && $userId !== ''
            ? User::query()->find($userId)
            : null;

        $this->recordStatusChange->execute(
            $appointment,
            $appointment->appointment_status_id,
            $attendedStatusId,
            AppointmentSource::Internal,
            $user instanceof User ? $user : null,
            'Cerrada al completar la(s) dosis de vacunación vinculadas.',
        );
    }
}
