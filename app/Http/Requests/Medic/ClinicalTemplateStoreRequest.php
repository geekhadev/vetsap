<?php

namespace App\Http\Requests\Medic;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\ClinicalTemplatePayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ClinicalTemplateStoreRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

    protected function prepareForValidation(): void
    {
        $this->merge(ClinicalTemplatePayloadValidationRules::mergeNormalizedNullableFields([
            'species_ids' => $this->input('species_ids'),
            'description' => $this->input('description'),
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

        return ClinicalTemplatePayloadValidationRules::storeRules($companyId);
    }

    /**
     * @return array<string, mixed>
     */
    public function templatePayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return ClinicalTemplatePayloadValidationRules::payload(
            (string) $this->selectedCompanyId(),
            $validated,
        );
    }
}
