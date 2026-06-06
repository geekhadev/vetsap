<?php

namespace App\Http\Requests\Medic;

use App\Support\Validation\DoctorPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class DoctorUpdateRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $merged = DoctorPayloadValidationRules::mergeNormalizedNullableFields([
            'phone' => $this->input('phone'),
            'email' => $this->input('email'),
        ]);

        if ($this->input('services_present') && ! $this->has('services')) {
            $merged['services'] = [];
        }

        $services = $this->input('services');
        if (is_array($services)) {
            foreach ($services as $index => $row) {
                if (! is_array($row)) {
                    continue;
                }
                $override = $row['duration_override_minutes'] ?? null;
                if ($override === '') {
                    $services[$index]['duration_override_minutes'] = null;
                }
            }
            $merged['services'] = $services;
        }

        $this->merge($merged);
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

        return DoctorPayloadValidationRules::updateRules($companyId);
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

    public function hasServicesPayload(): bool
    {
        return $this->has('services') || $this->filled('services_present');
    }

    /**
     * @return list<array{service_id: string, duration_override_minutes: int|null}>
     */
    public function servicesPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return DoctorPayloadValidationRules::servicesPayload($validated);
    }
}
