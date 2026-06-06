<?php

namespace App\Http\Requests\Medic;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\SpeciesPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SpeciesStoreRequest extends FormRequest
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

        return SpeciesPayloadValidationRules::storeRules($companyId);
    }

    /**
     * @return array{company_id: string, name: string, is_active: bool}
     */
    public function speciesPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return SpeciesPayloadValidationRules::storePayload(
            (string) $this->selectedCompanyId(),
            $validated,
        );
    }
}
