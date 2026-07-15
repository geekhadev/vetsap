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
                ...self::uniqueNameRules($companyId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
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
                ...self::uniqueNameRules($companyId, $specialtyId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return list<ValidationRule>
     */
    private static function uniqueNameRules(string $companyId, ?string $ignoreId = null): array
    {
        $unique = Rule::unique('medic_specialties', 'name')->where(function ($query) use ($companyId): void {
            $query->where(function ($inner) use ($companyId): void {
                $inner->where('company_id', $companyId)
                    ->orWhere(function ($global): void {
                        $global->where('is_global', true)->whereNull('company_id');
                    });
            });
        });

        if ($ignoreId !== null) {
            $unique->ignore($ignoreId);
        }

        return [$unique];
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function mergeNormalizedNullableFields(array $input): array
    {
        $nullable = ['description'];
        $merged = $input;

        foreach ($nullable as $field) {
            $value = $merged[$field] ?? null;
            $merged[$field] = ($value === null || $value === '') ? null : $value;
        }

        return $merged;
    }

    /**
     * @return array{company_id: string, name: string, description: string|null, is_global: bool, is_active: bool}
     */
    public static function storePayload(string $companyId, array $validated): array
    {
        return [
            'company_id' => $companyId,
            'name' => (string) $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_global' => false,
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ];
    }

    /**
     * @return array{name: string, description: string|null, is_active: bool}
     */
    public static function updatePayload(array $validated): array
    {
        return [
            'name' => (string) $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ];
    }
}
