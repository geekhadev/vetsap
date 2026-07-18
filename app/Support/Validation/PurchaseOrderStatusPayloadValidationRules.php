<?php

namespace App\Support\Validation;

use App\Enums\Purchase\PurchaseOrderStatusColor;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class PurchaseOrderStatusPayloadValidationRules
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
                Rule::unique('purchase_order_statuses', 'name')->where('company_id', $companyId),
            ],
            'color' => ['required', 'string', Rule::in(PurchaseOrderStatusColor::values())],
        ];
    }

    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function updateRules(string $companyId, string $purchaseOrderStatusId): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('purchase_order_statuses', 'name')
                    ->where('company_id', $companyId)
                    ->ignore($purchaseOrderStatusId),
            ],
            'color' => ['required', 'string', Rule::in(PurchaseOrderStatusColor::values())],
        ];
    }

    /**
     * @return array{company_id: string, name: string, color: string, is_global: bool}
     */
    public static function storePayload(string $companyId, array $validated): array
    {
        return [
            'company_id' => $companyId,
            'name' => (string) $validated['name'],
            'color' => (string) $validated['color'],
            'is_global' => false,
        ];
    }

    /**
     * @return array{name: string, color: string}
     */
    public static function updatePayload(array $validated): array
    {
        return [
            'name' => (string) $validated['name'],
            'color' => (string) $validated['color'],
        ];
    }
}
