<?php

namespace App\Http\Requests\Medic;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\ClinicalAttentionPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PatientDraftAttentionUpsertRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

    protected function prepareForValidation(): void
    {
        $this->merge(ClinicalAttentionPayloadValidationRules::mergeNormalizedNullableFields([
            'appointment_id' => $this->input('appointment_id'),
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
            return ['template_id' => ['nullable']];
        }

        return ClinicalAttentionPayloadValidationRules::draftAutosaveRules($companyId);
    }

    /**
     * @return array<string, mixed>
     */
    public function draftPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return ClinicalAttentionPayloadValidationRules::draftAutosavePayload($validated);
    }
}
