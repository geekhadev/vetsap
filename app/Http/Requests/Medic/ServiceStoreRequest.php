<?php

namespace App\Http\Requests\Medic;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\ServicePayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ServiceStoreRequest extends FormRequest
{
    use InteractsWithSelectedCompanyRequest;

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

        return ServicePayloadValidationRules::storeRules(
            $companyId,
            ServicePayloadValidationRules::resolveTimeBlockMinutes($this->selectedCompany()),
        );
    }

    /**
     * @return array{
     *     company_id: string,
     *     specialty_id: string,
     *     name: string,
     *     description: string|null,
     *     price: string|null,
     *     duration_minutes: int,
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
