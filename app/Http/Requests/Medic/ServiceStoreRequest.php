<?php

namespace App\Http\Requests\Medic;

use App\Models\Company;
use App\Support\Validation\ServicePayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ServiceStoreRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(ServicePayloadValidationRules::mergeNormalizedNullableFields([
            'description' => $this->input('description'),
            'price' => $this->input('price'),
            'duration_minutes' => $this->input('duration_minutes'),
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

        return ServicePayloadValidationRules::storeRules($companyId);
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
     * @return array{
     *     company_id: string,
     *     specialty_id: string,
     *     name: string,
     *     description: string|null,
     *     price: string|null,
     *     duration_minutes: int|null,
     *     is_active: bool
     * }
     */
    public function servicePayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return ServicePayloadValidationRules::storePayload(
            (string) $this->selectedCompanyId(),
            $validated,
        );
    }
}
