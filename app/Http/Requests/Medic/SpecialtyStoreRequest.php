<?php

namespace App\Http\Requests\Medic;

use App\Models\Company;
use App\Support\Validation\SpecialtyPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SpecialtyStoreRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(SpecialtyPayloadValidationRules::mergeNormalizedNullableFields([
            'description' => $this->input('description'),
            'icon' => $this->input('icon'),
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

    public function selectedCompanyId(): ?string
    {
        $id = data_get($this->session()->get('company_selected'), 'id');

        return is_string($id) && $id !== '' ? $id : null;
    }

    public function selectedCompany(): ?Company
    {
        $id = $this->selectedCompanyId();

        if ($id === null) {
            return null;
        }

        return Company::query()->find($id);
    }

    /**
     * @return array{company_id: string, name: string, description: string|null, icon: string|null, is_active: bool}
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
