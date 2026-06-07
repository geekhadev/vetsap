<?php

namespace App\Http\Requests\Agenda;

use App\Http\Requests\Concerns\InteractsWithSelectedCompanyRequest;
use App\Support\Validation\AppointmentPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AppointmentRescheduleRequest extends FormRequest
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
        if ($this->selectedCompanyId() === null) {
            return ['appointment_date' => ['required']];
        }

        return AppointmentPayloadValidationRules::rescheduleRules();
    }

    /**
     * @return array<string, mixed>
     */
    public function reschedulePayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return $validated;
    }
}
