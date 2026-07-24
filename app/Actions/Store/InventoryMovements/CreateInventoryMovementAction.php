<?php

namespace App\Actions\Store\InventoryMovements;

use App\Enums\Store\InventoryMovementType;
use App\Models\Store\InventoryMovement;
use App\Models\Store\InventoryMovementDetail;
use App\Models\Store\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class CreateInventoryMovementAction
{
    /**
     * @param  array{
     *     company_id: string,
     *     type: string,
     *     moved_at: string,
     *     movement_category_id: string,
     *     user_id: string,
     *     details: list<array{product_id: string, quantity: int}>,
     *     origin_type?: string|null,
     *     origin_id?: string|null,
     *     reversed_movement_id?: string|null,
     *     validate_stock?: bool,
     * }  $data
     */
    public function execute(array $data): InventoryMovement
    {
        $type = InventoryMovementType::from($data['type']);
        $validateStock = $data['validate_stock'] ?? true;

        return DB::transaction(function () use ($data, $type, $validateStock): InventoryMovement {
            $movement = InventoryMovement::query()->create([
                'company_id' => $data['company_id'],
                'type' => $type,
                'number' => $this->nextNumber($data['company_id'], $type),
                'moved_at' => $data['moved_at'],
                'movement_category_id' => $data['movement_category_id'],
                'user_id' => $data['user_id'],
                'origin_type' => $data['origin_type'] ?? null,
                'origin_id' => $data['origin_id'] ?? null,
                'reversed_movement_id' => $data['reversed_movement_id'] ?? null,
            ]);

            foreach ($data['details'] as $detail) {
                $product = Product::query()
                    ->whereKey($detail['product_id'])
                    ->where('company_id', $data['company_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                $quantity = (int) $detail['quantity'];

                if ($type === InventoryMovementType::Exit) {
                    if ($validateStock) {
                        $this->assertSufficientStock($product, $quantity);
                    }
                    $product->decrement('stock', $quantity);
                } else {
                    $product->increment('stock', $quantity);
                }

                InventoryMovementDetail::query()->create([
                    'inventory_movement_id' => $movement->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                ]);
            }

            return $movement->load(['movementCategory:id,name,type', 'user:id,name', 'details.product:id,name,barcode']);
        });
    }

    private function nextNumber(string $companyId, InventoryMovementType $type): int
    {
        $lastNumber = InventoryMovement::query()
            ->where('company_id', $companyId)
            ->where('type', $type)
            ->orderByDesc('number')
            ->lockForUpdate()
            ->value('number');

        return ((int) $lastNumber) + 1;
    }

    private function assertSufficientStock(Product $product, int $quantity): void
    {
        if ((int) $product->stock < $quantity) {
            throw ValidationException::withMessages([
                'details' => "Stock insuficiente para «{$product->name}». Disponible: ".(int) $product->stock.'.',
            ]);
        }
    }
}
