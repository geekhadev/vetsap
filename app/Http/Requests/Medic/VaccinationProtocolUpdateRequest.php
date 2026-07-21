<?php

namespace App\Http\Requests\Medic;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Models\Medic\VaccinationProtocol;
use App\Support\Validation\VaccinationProtocolPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class VaccinationProtocolUpdateRequest extends FormRequest
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
        /** @var VaccinationProtocol $protocol */
        $protocol = $this->route('vaccination_protocol');

        if ($companyId === null) {
            return ['name' => ['required']];
        }

        return VaccinationProtocolPayloadValidationRules::updateRules($companyId, $protocol->id);
    }

    public function withValidator(Validator $validator): void
    {
        VaccinationProtocolPayloadValidationRules::afterValidation($validator);
    }

    /**
     * @return array{
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

        return VaccinationProtocolPayloadValidationRules::updatePayload($validated);
    }
}
