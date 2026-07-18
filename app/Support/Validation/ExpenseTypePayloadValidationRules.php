<?php

namespace App\Support\Validation;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class ExpenseTypePayloadValidationRules
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
                ...self::uniqueFieldRules('name', $companyId),
            ],
            'abbreviation' => [
                'required',
                'string',
                'max:32',
                ...self::uniqueFieldRules('abbreviation', $companyId),
            ],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateRules(string $companyId, string $expenseTypeId): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                ...self::uniqueFieldRules('name', $companyId, $expenseTypeId),
            ],
            'abbreviation' => [
                'required',
                'string',
                'max:32',
                ...self::uniqueFieldRules('abbreviation', $companyId, $expenseTypeId),
            ],
        ];
    }

    /**
     * @return list<ValidationRule>
     */
    private static function uniqueFieldRules(string $column, string $companyId, ?string $ignoreId = null): array
    {
        $unique = Rule::unique('purchase_expense_types', $column)->where(function ($query) use ($companyId): void {
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
     * @return array{company_id: string, name: string, abbreviation: string, is_global: bool}
     */
    public static function storePayload(string $companyId, array $validated): array
    {
        return [
            'company_id' => $companyId,
            'name' => (string) $validated['name'],
            'abbreviation' => (string) $validated['abbreviation'],
            'is_global' => false,
        ];
    }

    /**
     * @return array{name: string, abbreviation: string}
     */
    public static function updatePayload(array $validated): array
    {
        return [
            'name' => (string) $validated['name'],
            'abbreviation' => (string) $validated['abbreviation'],
        ];
    }
}
