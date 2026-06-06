<?php

namespace App\Http\Requests\Medic;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\SpecialtyPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SpecialtyStoreRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

    protected function prepareForValidation(): void
    {
        $this->merge(SpecialtyPayloadValidationRules::mergeNormalizedNullableFields([
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

        return SpecialtyPayloadValidationRules::storeRules($companyId);
    }

    /**
     * @return array{company_id: string, name: string, description: string|null, is_active: bool}
     */
    public function specialtyPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return SpecialtyPayloadValidationRules::storePayload(
            (string) $this->selectedCompanyId(),
            $validated,
        );
    }
}
