<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Actions\Agenda\Appointments\RecordAppointmentStatusChangeAction;
use App\Enums\Agenda\AppointmentSource;
use App\Models\Agenda\Appointment;
use App\Models\Medic\ClinicalAttention;
use App\Models\User;
use App\Support\Validation\AppointmentPayloadValidationRules;

/**
 * Marca la cita vinculada como «Atendido» al completar una atención clínica.
 */
final class CompleteAppointmentForClinicalAttentionAction
{
    public const STATUS_CHANGE_REASON = 'clinical_attention_closed';

    public function __construct(
        private RecordAppointmentStatusChangeAction $recordStatusChange,
    ) {}

    public function execute(ClinicalAttention $attention, ?string $userId = null): void
    {
        $attention->loadMissing(['appointment.appointmentStatus:id,is_terminal']);

        $appointment = $attention->appointment;

        if (! $appointment instanceof Appointment) {
            return;
        }

        if ($appointment->appointmentStatus?->is_terminal) {
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
            AppointmentSource::System,
            $user instanceof User ? $user : null,
            'Cerrada al completar la atención clínica vinculada.',
            [
                'reason' => self::STATUS_CHANGE_REASON,
                'clinical_attention_id' => $attention->id,
            ],
        );
    }
}
