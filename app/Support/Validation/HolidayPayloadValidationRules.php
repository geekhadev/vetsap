<?php

namespace App\Support\Validation;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class HolidayPayloadValidationRules
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
            ],
            'date' => [
                'required',
                'date',
                Rule::unique('agenda_holidays', 'date')->where('company_id', $companyId),
            ],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateRules(string $companyId, string $holidayId): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'date' => [
                'required',
                'date',
                Rule::unique('agenda_holidays', 'date')
                    ->where('company_id', $companyId)
                    ->ignore($holidayId),
            ],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array{company_id: string, name: string, date: string, is_active: bool}
     */
    public static function storePayload(string $companyId, array $validated): array
    {
        return [
            'company_id' => $companyId,
            'name' => (string) $validated['name'],
            'date' => (string) $validated['date'],
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ];
    }

    /**
     * @return array{name: string, date: string, is_active: bool}
     */
    public static function updatePayload(array $validated): array
    {
        return [
            'name' => (string) $validated['name'],
            'date' => (string) $validated['date'],
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ];
    }
}
