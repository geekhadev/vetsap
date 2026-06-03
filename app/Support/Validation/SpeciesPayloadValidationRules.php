<?php

namespace App\Support\Validation;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class SpeciesPayloadValidationRules
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
                Rule::unique('medic_species', 'name')->where('company_id', $companyId),
            ],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateRules(string $companyId, string $speciesId): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('medic_species', 'name')
                    ->where('company_id', $companyId)
                    ->ignore($speciesId),
            ],
            'is_active' => ['required', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * @return array{company_id: string, name: string, is_active: bool}
     */
    public static function storePayload(string $companyId, array $validated): array
    {
        return [
            'company_id' => $companyId,
            'name' => (string) $validated['name'],
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ];
    }

    /**
     * @return array{name: string, is_active: bool, sort_order?: int}
     */
    public static function updatePayload(array $validated): array
    {
        $payload = [
            'name' => (string) $validated['name'],
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ];

        if (array_key_exists('sort_order', $validated) && $validated['sort_order'] !== null) {
            $payload['sort_order'] = (int) $validated['sort_order'];
        }

        return $payload;
    }
}
