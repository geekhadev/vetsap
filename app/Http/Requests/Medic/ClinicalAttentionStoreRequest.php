<?php

namespace App\Http\Requests\Medic;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\ClinicalAttentionPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ClinicalAttentionStoreRequest extends FormRequest
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

        return ClinicalAttentionPayloadValidationRules::storeRules($companyId);
    }

    /**
     * @return array<string, mixed>
     */
    public function attentionPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return ClinicalAttentionPayloadValidationRules::storePayload(
            (string) $this->selectedCompanyId(),
            $validated,
            $this->user()?->id,
        );
    }
}
