<?php

namespace App\Support\Validation;

use App\Enums\Agenda\AppointmentStatusColor;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class AppointmentStatusPayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(string $companyId): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('agenda_appointment_statuses', 'name')->where('company_id', $companyId),
            ],
            'color' => ['required', 'string', Rule::in(AppointmentStatusColor::values())],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateRules(string $companyId, string $appointmentStatusId): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('agenda_appointment_statuses', 'name')
                    ->where('company_id', $companyId)
                    ->ignore($appointmentStatusId),
            ],
            'color' => ['required', 'string', Rule::in(AppointmentStatusColor::values())],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array{company_id: string, name: string, color: string, is_global: bool, is_active: bool}
     */
    public static function storePayload(string $companyId, array $validated): array
    {
        return [
            'company_id' => $companyId,
            'name' => (string) $validated['name'],
            'color' => (string) $validated['color'],
            'is_global' => false,
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ];
    }

    /**
     * @return array{name: string, color: string, is_active: bool}
     */
    public static function updatePayload(array $validated): array
    {
        return [
            'name' => (string) $validated['name'],
            'color' => (string) $validated['color'],
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ];
    }
}
