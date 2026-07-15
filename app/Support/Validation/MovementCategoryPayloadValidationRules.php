<?php

namespace App\Support\Validation;

use App\Enums\Store\InventoryMovementType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class MovementCategoryPayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(?string $companyId, ?string $type): array
    {
        return self::baseRules($companyId, $type);
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateRules(?string $companyId, string $id, ?string $type): array
    {
        return [
            'name' => self::uniqueNameRules($companyId, $type, $id),
            'type' => ['required', 'string', Rule::in(InventoryMovementType::values())],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    private static function baseRules(?string $companyId, ?string $type): array
    {
        return [
            'name' => self::uniqueNameRules($companyId, $type),
            'type' => ['required', 'string', Rule::in(InventoryMovementType::values())],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return list<mixed>
     */
    private static function uniqueNameRules(?string $companyId, ?string $type, ?string $ignoreId = null): array
    {
        $unique = Rule::unique('store_movement_categories', 'name')
            ->where('type', $type ?? '');

        if ($companyId === null) {
            $unique->whereNull('company_id');
        } else {
            $unique->where('company_id', $companyId);
        }

        if ($ignoreId !== null) {
            $unique = $unique->ignore($ignoreId);
        }

        return [
            'required',
            'string',
            'max:255',
            $unique,
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{company_id: string|null, name: string, type: string, is_active: bool}
     */
    public static function storePayload(?string $companyId, array $validated): array
    {
        return [
            'company_id' => $companyId,
            'name' => (string) $validated['name'],
            'type' => (string) $validated['type'],
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{name: string, type: string, is_active: bool}
     */
    public static function updatePayload(array $validated): array
    {
        return [
            'name' => (string) $validated['name'],
            'type' => (string) $validated['type'],
            'is_active' => filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN),
        ];
    }
}
