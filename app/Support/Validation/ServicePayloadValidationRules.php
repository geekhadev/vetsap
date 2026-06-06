<?php

namespace App\Support\Validation;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class ServicePayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(string $companyId): array
    {
        return [
            'specialty_id' => [
                'required',
                'uuid',
                Rule::exists('medic_specialties', 'id')
                    ->where('company_id', $companyId)
                    ->where('is_active', true),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('medic_services', 'name')->where('company_id', $companyId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:999999999'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'is_active' => ['required', 'boolean'],
            'use_web' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateRules(string $companyId, string $serviceId): array
    {
        return [
            'specialty_id' => [
                'required',
                'uuid',
                Rule::exists('medic_specialties', 'id')
                    ->where('company_id', $companyId),
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('medic_services', 'name')
                    ->where('company_id', $companyId)
                    ->ignore($serviceId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:999999999'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'is_active' => ['required', 'boolean'],
            'use_web' => ['required', 'boolean'],
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function mergeNormalizedNullableFields(array $input): array
    {
        $nullable = ['description', 'price', 'duration_minutes'];
        $merged = $input;

        foreach ($nullable as $field) {
            $value = $merged[$field] ?? null;
            $merged[$field] = ($value === null || $value === '') ? null : $value;
        }

        return $merged;
    }

    /**
     * @return array{
     *     company_id: string,
     *     specialty_id: string,
     *     name: string,
     *     description: string|null,
     *     price: string|null,
     *     duration_minutes: int|null,
     *     is_active: bool,
     *     use_web: bool
     * }
     */
    public static function storePayload(string $companyId, array $validated): array
    {
        return [
            'company_id' => $companyId,
            'specialty_id' => (string) $validated['specialty_id'],
            'name' => (string) $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => self::normalizePrice($validated['price'] ?? null),
            'duration_minutes' => self::normalizeDuration($validated['duration_minutes'] ?? null),
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
            'use_web' => filter_var($validated['use_web'], FILTER_VALIDATE_BOOLEAN),
        ];
    }

    /**
     * @return array{
     *     specialty_id: string,
     *     name: string,
     *     description: string|null,
     *     price: string|null,
     *     duration_minutes: int|null,
     *     is_active: bool,
     *     use_web: bool
     * }
     */
    public static function updatePayload(array $validated): array
    {
        return [
            'specialty_id' => (string) $validated['specialty_id'],
            'name' => (string) $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => self::normalizePrice($validated['price'] ?? null),
            'duration_minutes' => self::normalizeDuration($validated['duration_minutes'] ?? null),
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
            'use_web' => filter_var($validated['use_web'], FILTER_VALIDATE_BOOLEAN),
        ];
    }

    private static function normalizePrice(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (string) (int) round((float) $value);
    }

    private static function normalizeDuration(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (int) $value;
    }
}
