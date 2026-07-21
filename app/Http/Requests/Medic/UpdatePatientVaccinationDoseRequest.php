<?php

namespace App\Http\Requests\Medic;

use App\Enums\Medic\VaccinationDoseStatus;
use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Models\Medic\PatientVaccinationDose;
use App\Support\Validation\PatientVaccinationPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientVaccinationDoseRequest extends FormRequest
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
        /** @var PatientVaccinationDose|null $dose */
        $dose = $this->route('dose');

        if (
            $dose instanceof PatientVaccinationDose
            && $dose->status === VaccinationDoseStatus::Administered
        ) {
            return PatientVaccinationPayloadValidationRules::updateAdministeredRules();
        }

        return PatientVaccinationPayloadValidationRules::updateScheduledRules();
    }
}
