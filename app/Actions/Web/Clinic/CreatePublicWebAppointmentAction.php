<?php

namespace App\Actions\Web\Clinic;

use App\Actions\Agenda\Appointments\CreateAppointmentAction;
use App\Actions\Medic\Patients\CreatePatientAction;
use App\Actions\Sale\Customers\CreateCustomerAction;
use App\Enums\Agenda\AppointmentSource;
use App\Enums\Medic\PatientSex;
use App\Enums\Sale\CustomerDocumentType;
use App\Models\Agenda\Appointment;
use App\Models\Medic\Patient;
use App\Models\Sale\Customer;
use App\Support\Phone\ChilePhone;
use App\Support\Validation\WebBookingPayloadValidationRules;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class CreatePublicWebAppointmentAction
{
    public function __construct(
        private LookupCustomerByPhoneForWebBookingAction $lookupCustomer,
        private CreateCustomerAction $createCustomer,
        private CreatePatientAction $createPatient,
        private CreateAppointmentAction $createAppointment,
    ) {}

    /**
     * @param  array<string, mixed>  $validated
     */
    public function execute(string $companyId, array $validated): Appointment
    {
        if (! ChilePhone::isValid((string) $validated['phone'])) {
            throw ValidationException::withMessages([
                'phone' => 'Ingresa un teléfono móvil chileno válido (9 dígitos).',
            ]);
        }

        WebBookingPayloadValidationRules::assertServiceIsWebVisible((string) $validated['service_id']);
        WebBookingPayloadValidationRules::assertDoctorProvidesWebService(
            (string) $validated['doctor_id'],
            (string) $validated['service_id'],
        );

        return DB::transaction(function () use ($companyId, $validated): Appointment {
            $customer = $this->resolveCustomer($companyId, $validated);
            $patient = $this->resolvePatient($companyId, $customer, $validated);

            $appointmentInput = [
                'customer_id' => $customer->id,
                'patient_id' => $patient->id,
                'doctor_id' => (string) $validated['doctor_id'],
                'service_id' => (string) $validated['service_id'],
                'office_id' => null,
                'appointment_date' => (string) $validated['appointment_date'],
                'starts_at_time' => (string) $validated['starts_at_time'],
                'notes' => null,
                'public_notes' => null,
            ];

            return $this->createAppointment->execute(
                $appointmentInput,
                $companyId,
                null,
                AppointmentSource::Web,
            );
        });
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function resolveCustomer(string $companyId, array $validated): Customer
    {
        if (! empty($validated['customer_id'])) {
            /** @var Customer|null $customer */
            $customer = Customer::query()
                ->forCompany($companyId)
                ->whereKey((string) $validated['customer_id'])
                ->first();

            if (! $customer instanceof Customer) {
                throw ValidationException::withMessages([
                    'customer_id' => 'El cliente seleccionado no es válido.',
                ]);
            }

            return $customer;
        }

        $existing = $this->lookupCustomer->execute($companyId, (string) $validated['phone']);

        if ($existing !== null) {
            /** @var Customer|null $customer */
            $customer = Customer::query()->whereKey($existing['id'])->first();

            if ($customer instanceof Customer) {
                return $customer;
            }
        }

        $normalizedPhone = ChilePhone::normalize((string) $validated['phone']);

        return $this->createCustomer->execute([
            'company_id' => $companyId,
            'name' => (string) $validated['client_name'],
            'document_type' => CustomerDocumentType::Pasaporte,
            'document_number' => $normalizedPhone,
            'email' => isset($validated['client_email']) && $validated['client_email'] !== ''
                ? (string) $validated['client_email']
                : null,
            'phone' => (string) $validated['phone'],
            'address' => null,
        ]);
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function resolvePatient(string $companyId, Customer $customer, array $validated): Patient
    {
        if (! empty($validated['patient_id'])) {
            /** @var Patient|null $patient */
            $patient = Patient::query()
                ->forCompany($companyId)
                ->whereKey((string) $validated['patient_id'])
                ->where('customer_id', $customer->id)
                ->where('is_active', true)
                ->first();

            if (! $patient instanceof Patient) {
                throw ValidationException::withMessages([
                    'patient_id' => 'La mascota seleccionada no pertenece al cliente indicado.',
                ]);
            }

            return $patient;
        }

        return $this->createPatient->execute([
            'company_id' => $companyId,
            'customer_id' => $customer->id,
            'species_id' => (string) $validated['species_id'],
            'record_number' => $this->generatePatientRecordNumber($companyId),
            'name' => (string) $validated['pet_name'],
            'breed' => null,
            'sex' => PatientSex::Unknown,
            'birth_date' => null,
            'weight_kg' => null,
            'is_sterilized' => false,
            'colors' => null,
            'blood_type' => null,
            'microchip_number' => null,
            'is_active' => true,
        ]);
    }

    private function generatePatientRecordNumber(string $companyId): string
    {
        do {
            $recordNumber = 'WEB-'.strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
        } while (
            Patient::query()
                ->forCompany($companyId)
                ->where('record_number', $recordNumber)
                ->exists()
        );

        return $recordNumber;
    }
}
