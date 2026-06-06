<?php

namespace App\Http\Requests\Medic;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Models\Medic\Patient;
use App\Support\Validation\PatientPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PatientUpdateRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

    protected function prepareForValidation(): void
    {
        $this->merge(PatientPayloadValidationRules::mergeNormalizedNullableFields([
            'breed' => $this->input('breed'),
            'birth_date' => $this->input('birth_date'),
            'weight_kg' => $this->input('weight_kg'),
            'colors' => $this->input('colors'),
            'blood_type' => $this->input('blood_type'),
            'microchip_number' => $this->input('microchip_number'),
        ]));
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
        $patient = $this->route('patient');

        if ($companyId === null || ! $patient instanceof Patient) {
            return ['name' => ['required']];
        }

        return PatientPayloadValidationRules::updateRules($companyId, $patient);
    }

    /**
     * @return array<string, mixed>
     */
    public function patientPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();
        $payload = PatientPayloadValidationRules::payload(
            (string) $this->selectedCompanyId(),
            $validated,
        );

        unset($payload['company_id']);

        return $payload;
    }

    public function redirectTarget(): string
    {
        $target = $this->input('redirect_to');

        return $target === 'customers' ? 'customers' : 'patients';
    }
}
