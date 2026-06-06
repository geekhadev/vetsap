<?php

namespace App\Http\Requests\Medic;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\PatientPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PatientStoreRequest extends FormRequest
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

        if ($companyId === null) {
            return ['name' => ['required']];
        }

        return PatientPayloadValidationRules::storeRules($companyId);
    }

    /**
     * @return array<string, mixed>
     */
    public function patientPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return PatientPayloadValidationRules::payload(
            (string) $this->selectedCompanyId(),
            $validated,
        );
    }

    public function redirectTarget(): string
    {
        $target = $this->input('redirect_to');

        return $target === 'customers' ? 'customers' : 'patients';
    }
}
