<?php

namespace App\Support\Validation;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class ExpensePayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(string $companyId): array
    {
        return [
            'spent_at' => ['required', 'date'],
            'expense_type_id' => self::expenseTypeIdRules($companyId),
            'amount' => ['required', 'numeric', 'min:0', 'max:999999999'],
            'reason' => ['required', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateRules(string $companyId): array
    {
        return self::storeRules($companyId);
    }

    /**
     * @return array{company_id: string, spent_at: string, expense_type_id: string, amount: string, reason: string}
     */
    public static function storePayload(string $companyId, array $validated): array
    {
        return [
            'company_id' => $companyId,
            'spent_at' => (string) $validated['spent_at'],
            'expense_type_id' => (string) $validated['expense_type_id'],
            'amount' => self::normalizeAmount($validated['amount']),
            'reason' => (string) $validated['reason'],
        ];
    }

    /**
     * @return array{spent_at: string, expense_type_id: string, amount: string, reason: string}
     */
    public static function updatePayload(array $validated): array
    {
        return [
            'spent_at' => (string) $validated['spent_at'],
            'expense_type_id' => (string) $validated['expense_type_id'],
            'amount' => self::normalizeAmount($validated['amount']),
            'reason' => (string) $validated['reason'],
        ];
    }

    /**
     * @return list<ValidationRule|string>
     */
    private static function expenseTypeIdRules(string $companyId): array
    {
        return [
            'required',
            'uuid',
            Rule::exists('purchase_expense_types', 'id')->where(function ($query) use ($companyId): void {
                $query->where(function ($inner) use ($companyId): void {
                    $inner->where('company_id', $companyId)
                        ->orWhere(function ($global): void {
                            $global->where('is_global', true)->whereNull('company_id');
                        });
                });
            }),
        ];
    }

    private static function normalizeAmount(mixed $value): string
    {
        return (string) (int) round((float) $value);
    }
}
