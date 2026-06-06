<?php

namespace App\Actions\Agenda\Appointments;

use App\Enums\Agenda\AppointmentSource;
use App\Models\Agenda\Appointment;
use App\Models\User;
use App\Support\Validation\AppointmentPayloadValidationRules;
use Illuminate\Support\Facades\DB;

final class CreateAppointmentAction
{
    public function __construct(
        private ResolveAppointmentServiceTermsAction $resolveServiceTerms,
        private RecordAppointmentStatusChangeAction $recordStatusChange,
    ) {}

    /**
     * @param  array<string, mixed>  $validated
     */
    public function execute(array $validated, string $companyId, User $user): Appointment
    {
        $terms = $this->resolveServiceTerms->execute(
            (string) $validated['doctor_id'],
            (string) $validated['service_id'],
        );

        $scheduling = AppointmentPayloadValidationRules::validatedSchedulingWindow(
            $validated,
            $companyId,
            $terms['duration_minutes'],
        );

        $payload = AppointmentPayloadValidationRules::storePayload(
            $companyId,
            $validated,
            $terms['duration_minutes'],
            $terms['price'],
            $scheduling['starts_at'],
            $scheduling['ends_at'],
        );

        $pendingStatusId = AppointmentPayloadValidationRules::defaultPendingStatusId();

        return DB::transaction(function () use ($payload, $pendingStatusId, $user): Appointment {
            $appointment = Appointment::query()->create([
                ...$payload,
                'appointment_status_id' => $pendingStatusId,
                'created_by_user_id' => $user->id,
                'updated_by_user_id' => $user->id,
            ]);

            $this->recordStatusChange->execute(
                $appointment,
                null,
                $pendingStatusId,
                AppointmentSource::Internal,
                $user,
            );

            return $appointment->refresh();
        });
    }
}
