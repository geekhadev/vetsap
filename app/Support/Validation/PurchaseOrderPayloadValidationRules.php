<?php

namespace App\Support\Validation;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class PurchaseOrderPayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(string $companyId): array
    {
        return [
            'ordered_at' => ['required', 'date'],
            'supplier_id' => [
                'required',
                'uuid',
                Rule::exists('purchase_suppliers', 'id')->where('company_id', $companyId),
            ],
            'purchase_order_status_id' => self::statusIdRules($companyId),
            'details' => ['required', 'array', 'min:1'],
            'details.*.product_id' => [
                'required',
                'uuid',
                'distinct',
                Rule::exists('store_products', 'id')
                    ->where('company_id', $companyId)
                    ->where('is_active', true),
            ],
            'details.*.quantity' => ['required', 'integer', 'min:1'],
            'details.*.unit_price' => ['required', 'numeric', 'min:0', 'max:999999999'],
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
     * @param  array<string, mixed>  $validated
     * @return array{
     *     company_id: string,
     *     ordered_at: string,
     *     supplier_id: string,
     *     purchase_order_status_id: string,
     *     details: list<array{product_id: string, quantity: int, unit_price: string, total: string}>,
     *     total: string
     * }
     */
    public static function storePayload(string $companyId, array $validated): array
    {
        $details = self::normalizeDetails($validated['details']);

        return [
            'company_id' => $companyId,
            'ordered_at' => (string) $validated['ordered_at'],
            'supplier_id' => (string) $validated['supplier_id'],
            'purchase_order_status_id' => (string) $validated['purchase_order_status_id'],
            'details' => $details,
            'total' => self::sumDetailsTotal($details),
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{
     *     ordered_at: string,
     *     supplier_id: string,
     *     purchase_order_status_id: string,
     *     details: list<array{product_id: string, quantity: int, unit_price: string, total: string}>,
     *     total: string
     * }
     */
    public static function updatePayload(array $validated): array
    {
        $details = self::normalizeDetails($validated['details']);

        return [
            'ordered_at' => (string) $validated['ordered_at'],
            'supplier_id' => (string) $validated['supplier_id'],
            'purchase_order_status_id' => (string) $validated['purchase_order_status_id'],
            'details' => $details,
            'total' => self::sumDetailsTotal($details),
        ];
    }

    /**
     * @return list<ValidationRule|string>
     */
    private static function statusIdRules(string $companyId): array
    {
        return [
            'required',
            'uuid',
            Rule::exists('purchase_order_statuses', 'id')->where(function ($query) use ($companyId): void {
                $query->where(function ($inner) use ($companyId): void {
                    $inner->where('company_id', $companyId)
                        ->orWhere(function ($global): void {
                            $global->where('is_global', true)->whereNull('company_id');
                        });
                });
            }),
        ];
    }

    /**
     * @param  list<array{product_id: mixed, quantity: mixed, unit_price: mixed}>  $details
     * @return list<array{product_id: string, quantity: int, unit_price: string, total: string}>
     */
    private static function normalizeDetails(array $details): array
    {
        return array_map(
            static function (array $detail): array {
                $quantity = (int) $detail['quantity'];
                $unitPrice = self::normalizeMoney($detail['unit_price']);
                $lineTotal = (string) ((int) $unitPrice * $quantity);

                return [
                    'product_id' => (string) $detail['product_id'],
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total' => $lineTotal,
                ];
            },
            $details,
        );
    }

    /**
     * @param  list<array{total: string}>  $details
     */
    private static function sumDetailsTotal(array $details): string
    {
        $sum = 0;

        foreach ($details as $detail) {
            $sum += (int) $detail['total'];
        }

        return (string) $sum;
    }

    private static function normalizeMoney(mixed $value): string
    {
        return (string) (int) round((float) $value);
    }
}
