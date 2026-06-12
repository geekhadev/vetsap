<?php

namespace App\Http\Requests\Medic;

use App\Models\Company;
use App\Models\Medic\Service;
use App\Support\Validation\ServicePayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ServiceUpdateRequest extends FormRequest
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
        $companyId = data_get($this->session()->get('company_selected'), 'id');
        $service = $this->route('service');

        if (! is_string($companyId) || $companyId === '' || ! $service instanceof Service) {
            return ['name' => ['required']];
        }

        return ServicePayloadValidationRules::updateRules(
            $companyId,
            (string) $service->id,
            ServicePayloadValidationRules::resolveTimeBlockMinutes(
                Company::query()->find($companyId),
            ),
        );
    }

    /**
     * @return array{
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

        return ServicePayloadValidationRules::updatePayload($validated);
    }
}
