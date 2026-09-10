<?php

namespace App\Http\Requests\Agenda;

use App\Enums\Medic\PatientSex;
use App\Enums\Sale\CustomerDocumentType;
use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\AppointmentCreatePatientValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreatePatientForAppointmentRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

    protected function prepareForValidation(): void
    {
        $this->merge([
            'customer_id' => $this->filled('customer_id')
                ? $this->input('customer_id')
                : null,
            'customer_name' => is_string($this->input('customer_name'))
                ? trim($this->input('customer_name'))
                : $this->input('customer_name'),
            'document_number' => is_string($this->input('document_number'))
                ? trim($this->input('document_number'))
                : $this->input('document_number'),
            'phone' => ($this->input('phone') === null || $this->input('phone') === '')
                ? null
                : $this->input('phone'),
            'record_number' => ($this->input('record_number') === null || $this->input('record_number') === '')
                ? null
                : $this->input('record_number'),
            'name' => is_string($this->input('name'))
                ? trim($this->input('name'))
                : $this->input('name'),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $companyId = $this->selectedCompanyId();

        if ($companyId === null) {
            return ['name' => ['required']];
        }

        return AppointmentCreatePatientValidationRules::rules($companyId);
    }

    /**
     * @return array{
     *     customer_id: string|null,
     *     document_type: CustomerDocumentType,
     *     document_number: string,
     *     customer_name: string|null,
     *     phone: string|null,
     *     name: string,
     *     record_number: string|null,
     *     species_id: string,
     *     sex: PatientSex,
     * }
     */
    public function patientPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return AppointmentCreatePatientValidationRules::payload($validated);
    }
}
