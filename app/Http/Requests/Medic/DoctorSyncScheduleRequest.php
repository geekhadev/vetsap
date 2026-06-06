<?php

namespace App\Http\Requests\Medic;

use App\Support\Validation\DoctorPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class DoctorSyncScheduleRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->input('blocks_present') && ! $this->has('blocks')) {
            $this->merge(['blocks' => []]);
        }
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

        if (! is_string($companyId) || $companyId === '') {
            return ['blocks' => ['present']];
        }

        return DoctorPayloadValidationRules::syncScheduleRules();
    }

    /**
     * @return list<array{day_of_week: int, starts_at: string, ends_at: string}>
     */
    public function schedulePayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return DoctorPayloadValidationRules::schedulePayload($validated);
    }
}
