<?php

namespace App\Http\Requests\Agenda;

use App\Models\Agenda\Holiday;
use App\Support\Validation\HolidayPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class HolidayUpdateRequest extends FormRequest
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
        $holiday = $this->route('holiday');

        if (! is_string($companyId) || $companyId === '' || ! $holiday instanceof Holiday) {
            return ['name' => ['required']];
        }

        return HolidayPayloadValidationRules::updateRules($companyId, (string) $holiday->id);
    }

    /**
     * @return array{name: string, date: string, is_active: bool}
     */
    public function holidayPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return HolidayPayloadValidationRules::updatePayload($validated);
    }
}
