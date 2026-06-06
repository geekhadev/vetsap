<?php

namespace App\Http\Requests\Agenda;

use App\Models\Agenda\AppointmentStatus;
use App\Support\Validation\AppointmentStatusPayloadValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AppointmentStatusUpdateRequest extends FormRequest
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
        $appointmentStatus = $this->route('appointment_status');

        if (! is_string($companyId) || $companyId === '' || ! $appointmentStatus instanceof AppointmentStatus) {
            return ['name' => ['required']];
        }

        return AppointmentStatusPayloadValidationRules::updateRules($companyId, (string) $appointmentStatus->id);
    }

    /**
     * @return array{name: string, color: string, is_active: bool}
     */
    public function appointmentStatusPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        return AppointmentStatusPayloadValidationRules::updatePayload($validated);
    }
}
