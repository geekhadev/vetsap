<?php

namespace App\Http\Requests\Medic;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\VaccinationProtocolPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class VaccinationProtocolStoreRequest extends FormRequest
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

        if ($companyId === null) {
            return ['name' => ['required']];
        }

        return VaccinationProtocolPayloadValidationRules::storeRules($companyId);
    }

    public function withValidator(Validator $validator): void
    {
        VaccinationProtocolPayloadValidationRules::afterValidation($validator);
    }

    /**
     * @return array{
     *     company_id: string,
     *     species_id: string,
     *     name: string,
     *     description: string|null,
     *     version: int,
     *     is_active: bool,
     *     items: list<array{
     *         product_id: string,
     *         schedule_type: string,
     *         week_number: int|null,
     *         min_age_weeks: int|null,
     *         max_age_weeks: int|null,
     *         interval_months: int|null,
     *         series_key: string|null,
     *         sort_order: int
     *     }>
     * }
     */
    public function protocolPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return VaccinationProtocolPayloadValidationRules::storePayload(
            (string) $this->selectedCompanyId(),
            $validated,
        );
    }
}
