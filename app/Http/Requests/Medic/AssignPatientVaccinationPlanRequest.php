<?php

namespace App\Http\Requests\Medic;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Models\Medic\Patient;
use App\Support\Validation\PatientVaccinationPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AssignPatientVaccinationPlanRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

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
        /** @var Patient|null $patient */
        $patient = $this->route('patient');

        if ($companyId === null || ! $patient instanceof Patient || $patient->species_id === null) {
            return ['protocol_id' => ['required']];
        }

        return PatientVaccinationPayloadValidationRules::assignRules(
            $companyId,
            $patient->species_id,
        );
    }
}
