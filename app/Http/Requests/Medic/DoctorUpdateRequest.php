<?php

namespace App\Http\Requests\Medic;

use App\Support\Validation\DoctorPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class DoctorUpdateRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(DoctorPayloadValidationRules::mergeNormalizedNullableFields([
            'phone' => $this->input('phone'),
            'email' => $this->input('email'),
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
        $doctor = $this->route('doctor');

        if (! is_string($companyId) || $companyId === '' || $doctor === null) {
            return ['first_name' => ['required']];
        }

        return DoctorPayloadValidationRules::updateRules();
    }

    /**
     * @return array{
     *     first_name: string,
     *     last_name: string,
     *     phone: string|null,
     *     email: string|null,
     *     is_active: bool,
     *     use_web: bool
     * }
     */
    public function doctorPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return DoctorPayloadValidationRules::updatePayload($validated);
    }
}
