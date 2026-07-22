<?php

namespace App\Actions\Customer\Appointments;

use App\Actions\Agenda\Appointments\CreateAppointmentAction;
use App\Enums\Agenda\AppointmentSource;
use App\Models\Agenda\Appointment;
use App\Models\Medic\Patient;
use App\Models\Sale\Customer;
use App\Models\User;
use App\Support\Validation\WebBookingPayloadValidationRules;
use Illuminate\Validation\ValidationException;

final class CreateCustomerAppointmentAction
{
    public function __construct(
        private CreateAppointmentAction $createAppointment,
    ) {}

    /**
     * @param  array<string, mixed>  $validated
     */
    public function execute(User $user, string $companyId, array $validated): Appointment
    {
        $patient = $this->resolvePatientForUser(
            $user,
            $companyId,
            (string) $validated['patient_id'],
        );

        WebBookingPayloadValidationRules::assertServiceIsWebVisible((string) $validated['service_id']);
        WebBookingPayloadValidationRules::assertDoctorProvidesWebService(
            (string) $validated['doctor_id'],
            (string) $validated['service_id'],
        );

        $notes = isset($validated['notes']) && is_string($validated['notes']) && $validated['notes'] !== ''
            ? $validated['notes']
            : null;

        return $this->createAppointment->execute(
            [
                'customer_id' => $patient->customer_id,
                'patient_id' => $patient->id,
                'doctor_id' => (string) $validated['doctor_id'],
                'service_id' => (string) $validated['service_id'],
                'office_id' => null,
                'appointment_date' => (string) $validated['appointment_date'],
                'starts_at_time' => (string) $validated['starts_at_time'],
                'notes' => null,
                'public_notes' => $notes,
            ],
            $companyId,
            $user,
            AppointmentSource::Web,
        );
    }

    private function resolvePatientForUser(User $user, string $companyId, string $patientId): Patient
    {
        $customerIds = Customer::query()
            ->where('user_id', $user->id)
            ->where('company_id', $companyId)
            ->pluck('id');

        if ($customerIds->isEmpty()) {
            throw ValidationException::withMessages([
                'patient_id' => 'No tienes mascotas asociadas a esta clínica.',
            ]);
        }

        /** @var Patient|null $patient */
        $patient = Patient::query()
            ->forCompany($companyId)
            ->whereKey($patientId)
            ->whereIn('customer_id', $customerIds)
            ->where('is_active', true)
            ->first();

        if (! $patient instanceof Patient) {
            throw ValidationException::withMessages([
                'patient_id' => 'La mascota seleccionada no es válida.',
            ]);
        }

        return $patient;
    }
}
