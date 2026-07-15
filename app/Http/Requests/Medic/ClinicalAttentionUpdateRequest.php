<?php

namespace App\Http\Requests\Medic;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\ClinicalAttentionPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ClinicalAttentionUpdateRequest extends FormRequest
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
            return ['template_id' => ['required']];
        }

        return ClinicalAttentionPayloadValidationRules::updateRules($companyId);
    }

    /**
     * @return array<string, mixed>
     */
    public function attentionPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return ClinicalAttentionPayloadValidationRules::updatePayload(
            $validated,
            $this->user()?->id,
        );
    }
}
