<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Actions\Agenda\Appointments\RecordAppointmentStatusChangeAction;
use App\Enums\Agenda\AppointmentSource;
use App\Enums\Medic\ClinicalAttentionStatus;
use App\Models\Agenda\Appointment;
use App\Models\Agenda\AppointmentStatusLog;
use App\Models\Medic\ClinicalAttention;
use App\Models\User;
use App\Support\Validation\AppointmentPayloadValidationRules;

/**
 * Si la cita quedó en «Atendido» por el cierre de la atención, la revierte al eliminar esa atención.
 */
final class RevertAppointmentStatusAfterClinicalAttentionDeletedAction
{
    public const STATUS_CHANGE_REASON = 'clinical_attention_deleted';

    public function __construct(
        private RecordAppointmentStatusChangeAction $recordStatusChange,
    ) {}

    public function execute(ClinicalAttention $attention, ?string $userId = null): void
    {
        if ($attention->status !== ClinicalAttentionStatus::Closed) {
            return;
        }

        $appointmentId = $attention->appointment_id;

        if (! is_string($appointmentId) || $appointmentId === '') {
            return;
        }

        /** @var Appointment|null $appointment */
        $appointment = Appointment::query()
            ->with('appointmentStatus:id,is_terminal')
            ->find($appointmentId);

        if (! $appointment instanceof Appointment) {
            return;
        }

        $attendedStatusId = AppointmentPayloadValidationRules::defaultAttendedStatusId();

        if ($appointment->appointment_status_id !== $attendedStatusId) {
            return;
        }

        $revertToStatusId = $this->resolvePreviousStatusId($appointment->id, $attendedStatusId, $attention->id);

        if ($revertToStatusId === null || $revertToStatusId === $attendedStatusId) {
            return;
        }

        $user = is_string($userId) && $userId !== ''
            ? User::query()->find($userId)
            : null;

        $this->recordStatusChange->execute(
            $appointment,
            $appointment->appointment_status_id,
            $revertToStatusId,
            AppointmentSource::System,
            $user instanceof User ? $user : null,
            'Revertido al eliminar la atención clínica vinculada.',
            [
                'reason' => self::STATUS_CHANGE_REASON,
                'clinical_attention_id' => $attention->id,
            ],
        );
    }

    private function resolvePreviousStatusId(
        string $appointmentId,
        string $attendedStatusId,
        string $attentionId,
    ): ?string {
        /** @var AppointmentStatusLog|null $autoCloseLog */
        $autoCloseLog = AppointmentStatusLog::query()
            ->where('appointment_id', $appointmentId)
            ->where('to_appointment_status_id', $attendedStatusId)
            ->where('metadata->reason', CompleteAppointmentForClinicalAttentionAction::STATUS_CHANGE_REASON)
            ->where('metadata->clinical_attention_id', $attentionId)
            ->orderByDesc('occurred_at')
            ->first();

        if ($autoCloseLog instanceof AppointmentStatusLog) {
            $hasLaterChange = AppointmentStatusLog::query()
                ->where('appointment_id', $appointmentId)
                ->where('occurred_at', '>', $autoCloseLog->occurred_at)
                ->exists();

            if (! $hasLaterChange && is_string($autoCloseLog->from_appointment_status_id)) {
                return $autoCloseLog->from_appointment_status_id;
            }
        }

        /** @var AppointmentStatusLog|null $latestToAttended */
        $latestToAttended = AppointmentStatusLog::query()
            ->where('appointment_id', $appointmentId)
            ->where('to_appointment_status_id', $attendedStatusId)
            ->orderByDesc('occurred_at')
            ->first();

        if ($latestToAttended instanceof AppointmentStatusLog
            && is_string($latestToAttended->from_appointment_status_id)
        ) {
            return $latestToAttended->from_appointment_status_id;
        }

        return AppointmentPayloadValidationRules::defaultPendingStatusId();
    }
}
