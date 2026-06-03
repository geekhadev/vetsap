<?php

namespace App\Http\Requests\Medic;

use App\Models\Medic\Specialty;
use App\Support\Validation\SpecialtyPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SpecialtyUpdateRequest extends FormRequest
{
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
        $companyId = data_get($this->session()->get('company_selected'), 'id');
        $specialty = $this->route('specialty');

        if (! is_string($companyId) || $companyId === '' || ! $specialty instanceof Specialty) {
            return ['name' => ['required']];
        }

        return SpecialtyPayloadValidationRules::updateRules($companyId, (string) $specialty->id);
    }

    /**
     * @return array{name: string, description: string|null, is_active: bool}
     */
    public function specialtyPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return SpecialtyPayloadValidationRules::updatePayload($validated);
    }
}
