<?php

namespace App\Http\Requests\Medic;

use App\Models\Medic\Species;
use App\Support\Validation\SpeciesPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SpeciesUpdateRequest extends FormRequest
{
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
        $species = $this->route('species');

        if (! is_string($companyId) || $companyId === '' || ! $species instanceof Species) {
            return ['name' => ['required']];
        }

        return SpeciesPayloadValidationRules::updateRules($companyId, (string) $species->id);
    }

    /**
     * @return array{name: string, is_active: bool, sort_order?: int}
     */
    public function speciesPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return SpeciesPayloadValidationRules::updatePayload($validated);
    }
}
