<?php

namespace App\Support\Validation;

use App\Enums\Store\InventoryMovementType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

final class InventoryMovementPayloadValidationRules
{
    /**
     * @return array<string, ValidationRule|array<int, mixed|string>|string>
     */
    public static function storeRules(string $companyId, InventoryMovementType $type): array
    {
        return [
            'type' => ['required', 'string', Rule::in([$type->value])],
            'moved_at' => ['required', 'date'],
            'movement_category_id' => [
                'required',
                'uuid',
                Rule::exists('store_movement_categories', 'id')->where(function ($query) use ($companyId, $type): void {
                    $query->where('type', $type->value)
                        ->where('is_active', true)
                        ->where(function ($inner) use ($companyId): void {
                            $inner->where('company_id', $companyId)
                                ->orWhereNull('company_id');
                        });
                }),
            ],
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
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     * @return array{
     *     company_id: string,
     *     type: string,
     *     moved_at: string,
     *     movement_category_id: string,
     *     user_id: string,
     *     details: list<array{product_id: string, quantity: int}>
     * }
     */
    public static function storePayload(
        string $companyId,
        string $userId,
        InventoryMovementType $type,
        array $validated,
    ): array {
        /** @var list<array{product_id: string, quantity: mixed}> $details */
        $details = $validated['details'];

        return [
            'company_id' => $companyId,
            'type' => $type->value,
            'moved_at' => (string) $validated['moved_at'],
            'movement_category_id' => (string) $validated['movement_category_id'],
            'user_id' => $userId,
            'details' => array_map(
                static fn (array $detail): array => [
                    'product_id' => (string) $detail['product_id'],
                    'quantity' => (int) $detail['quantity'],
                ],
                $details,
            ),
        ];
    }
}
