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
                ...self::uniqueNameRules($companyId),
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
                ...self::uniqueNameRules($companyId, $speciesId),
            ],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return list<ValidationRule>
     */
    private static function uniqueNameRules(string $companyId, ?string $ignoreId = null): array
    {
        $unique = Rule::unique('medic_species', 'name')->where(function ($query) use ($companyId): void {
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
     * @return array{company_id: string, name: string, is_global: bool, is_active: bool}
     */
    public static function storePayload(string $companyId, array $validated): array
    {
        return [
            'company_id' => $companyId,
            'name' => (string) $validated['name'],
            'is_global' => false,
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ];
    }

    /**
     * @return array{name: string, is_active: bool}
     */
    public static function updatePayload(array $validated): array
    {
        return [
            'name' => (string) $validated['name'],
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ];
    }
}
