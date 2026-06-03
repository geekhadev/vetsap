<?php

namespace App\Support\Validation;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class SpecialtyPayloadValidationRules
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
                Rule::unique('medic_specialties', 'name')->where('company_id', $companyId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:100'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateRules(string $companyId, string $specialtyId): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('medic_specialties', 'name')
                    ->where('company_id', $companyId)
                    ->ignore($specialtyId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:100'],
            'is_active' => ['required', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function mergeNormalizedNullableFields(array $input): array
    {
        $nullable = ['description', 'icon'];
        $merged = $input;

        foreach ($nullable as $field) {
            $value = $merged[$field] ?? null;
            $merged[$field] = ($value === null || $value === '') ? null : $value;
        }

        return $merged;
    }

    /**
     * @return array{company_id: string, name: string, description: string|null, icon: string|null, is_active: bool}
     */
    public static function storePayload(string $companyId, array $validated): array
    {
        return [
            'company_id' => $companyId,
            'name' => (string) $validated['name'],
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? null,
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ];
    }

    /**
     * @return array{name: string, description: string|null, icon: string|null, is_active: bool, sort_order?: int}
     */
    public static function updatePayload(array $validated): array
    {
        $payload = [
            'name' => (string) $validated['name'],
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? null,
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ];

        if (array_key_exists('sort_order', $validated) && $validated['sort_order'] !== null) {
            $payload['sort_order'] = (int) $validated['sort_order'];
        }

        return $payload;
    }
}
