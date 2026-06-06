<?php

namespace App\Support\Store;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class StoreMasterRecordValidation
{
    /**
     * @return array<int, ValidationRule|string>
     */
    public static function nameRules(string $table, ?string $companyId, ?string $ignoreId = null): array
    {
        $unique = Rule::unique($table, 'name');

        if ($companyId === null) {
            $unique->whereNull('company_id');
        } else {
            $unique->where('company_id', $companyId);
        }

        if ($ignoreId !== null) {
            $unique->ignore($ignoreId);
        }

        return ['required', 'string', 'max:255', $unique];
    }

    /**
     * @return array<int, ValidationRule|string>
     */
    public static function isActiveRules(): array
    {
        return ['required', 'boolean'];
    }

    /**
     * @return array{company_id: string|null, name: string, is_active: bool}
     */
    public static function storePayload(?string $companyId, array $validated): array
    {
        return [
            'company_id' => $companyId,
            'name' => (string) $validated['name'],
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

    /**
     * @return array<int, ValidationRule|string>
     */
    public static function belongsToCompanyOrGlobalRules(
        string $table,
        string $companyId,
        string $column = 'id',
    ): array {
        return [
            'required',
            'uuid',
            Rule::exists($table, $column)->where(function ($query) use ($companyId): void {
                $query->where('is_active', true)
                    ->where(function ($inner) use ($companyId): void {
                        $inner->where('company_id', $companyId)
                            ->orWhereNull('company_id');
                    });
            }),
        ];
    }
}
