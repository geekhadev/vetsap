<?php

namespace App\Actions\Agenda\Appointments;

use App\Actions\Medic\Patients\CreatePatientAction;
use App\Actions\Sale\Customers\CreateCustomerAction;
use App\Enums\Medic\PatientSex;
use App\Enums\Sale\CustomerDocumentType;
use App\Models\Medic\Patient;
use App\Models\Sale\Customer;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class CreatePatientForAppointmentFormAction
{
    public function __construct(
        private CreateCustomerAction $createCustomer,
        private CreatePatientAction $createPatient,
        private BuildAppointmentFormOptionsAction $buildFormOptions,
    ) {}

    /**
     * @param  array{
     *     customer_id?: string|null,
     *     document_type: CustomerDocumentType|string,
     *     document_number: string,
     *     customer_name?: string|null,
     *     phone?: string|null,
     *     name: string,
     *     record_number?: string|null,
     *     species_id: string,
     *     sex: PatientSex|string,
     * }  $data
     * @return array{id: string, label: string, customer_id: string, search_text: string}
     */
    public function execute(string $companyId, array $data): array
    {
        return DB::transaction(function () use ($companyId, $data): array {
            $customer = $this->resolveCustomer($companyId, $data);

            $recordNumber = isset($data['record_number']) && is_string($data['record_number'])
                && trim($data['record_number']) !== ''
                    ? trim($data['record_number'])
                    : $this->generatePatientRecordNumber($companyId);

            $sex = $data['sex'] instanceof PatientSex
                ? $data['sex']
                : PatientSex::from((string) $data['sex']);

            $patient = $this->createPatient->execute([
                'company_id' => $companyId,
                'customer_id' => $customer->id,
                'species_id' => (string) $data['species_id'],
                'record_number' => $recordNumber,
                'name' => (string) $data['name'],
                'breed' => null,
                'sex' => $sex,
                'birth_date' => null,
                'weight_kg' => null,
                'is_sterilized' => false,
                'colors' => null,
                'blood_type' => null,
                'microchip_number' => null,
                'is_active' => true,
            ]);

            $patient->load(['customer:id,name,document_number,phone']);

            return $this->buildFormOptions->mapPatientOption($patient);
        });
    }

    /**
     * @param  array{
     *     customer_id?: string|null,
     *     document_type: CustomerDocumentType|string,
     *     document_number: string,
     *     customer_name?: string|null,
     *     phone?: string|null,
     * }  $data
     */
    private function resolveCustomer(string $companyId, array $data): Customer
    {
        $customerId = isset($data['customer_id']) && is_string($data['customer_id'])
            && $data['customer_id'] !== ''
                ? $data['customer_id']
                : null;

        if ($customerId !== null) {
            /** @var Customer|null $customer */
            $customer = Customer::query()
                ->forCompany($companyId)
                ->whereKey($customerId)
                ->first();

            if (! $customer instanceof Customer) {
                throw ValidationException::withMessages([
                    'customer_id' => 'El cliente seleccionado no es válido.',
                ]);
            }

            return $customer;
        }

        $documentType = $data['document_type'] instanceof CustomerDocumentType
            ? $data['document_type']
            : CustomerDocumentType::from((string) $data['document_type']);

        $customerName = trim((string) ($data['customer_name'] ?? ''));

        if ($customerName === '') {
            throw ValidationException::withMessages([
                'customer_name' => 'El nombre del cliente es obligatorio.',
            ]);
        }

        return $this->createCustomer->execute([
            'company_id' => $companyId,
            'name' => $customerName,
            'document_type' => $documentType,
            'document_number' => (string) $data['document_number'],
            'email' => null,
            'phone' => isset($data['phone']) && is_string($data['phone']) && $data['phone'] !== ''
                ? $data['phone']
                : null,
            'address' => null,
        ]);
    }

    private function generatePatientRecordNumber(string $companyId): string
    {
        do {
            $recordNumber = 'PAC-'.strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
        } while (
            Patient::query()
                ->forCompany($companyId)
                ->where('record_number', $recordNumber)
                ->exists()
        );

        return $recordNumber;
    }
}
