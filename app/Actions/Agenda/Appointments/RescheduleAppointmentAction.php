<?php

namespace App\Actions\Agenda\Appointments;

use App\Models\Agenda\Appointment;
use App\Models\User;
use App\Support\Validation\AppointmentPayloadValidationRules;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class RescheduleAppointmentAction
{
    /**
     * @param  array<string, mixed>  $validated
     */
    public function execute(
        Appointment $appointment,
        array $validated,
        User $user,
    ): Appointment {
        $appointment->loadMissing('appointmentStatus:id,is_terminal');

        if ($appointment->appointmentStatus?->is_terminal) {
            throw ValidationException::withMessages([
                'appointment_date' => 'No se puede reagendar una cita en estado terminal.',
            ]);
        }

        $scheduling = AppointmentPayloadValidationRules::validatedRescheduleWindow(
            $validated,
            (string) $appointment->company_id,
            (int) $appointment->duration_minutes,
            (string) $appointment->doctor_id,
            (string) $appointment->id,
        );

        if ($this->hasSameSchedule($appointment->starts_at, $scheduling['starts_at'])) {
            return $appointment;
        }

        return DB::transaction(function () use ($appointment, $scheduling, $user): Appointment {
            $appointment->update([
                'starts_at' => $scheduling['starts_at'],
                'ends_at' => $scheduling['ends_at'],
                'updated_by_user_id' => $user->id,
            ]);

            return $appointment->refresh();
        });
    }

    private function hasSameSchedule(
        CarbonInterface $currentStartsAt,
        CarbonInterface $newStartsAt,
    ): bool {
        return $currentStartsAt->equalTo($newStartsAt);
    }
}
