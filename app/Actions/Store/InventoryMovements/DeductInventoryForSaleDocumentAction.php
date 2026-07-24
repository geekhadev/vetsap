<?php

namespace App\Actions\Store\InventoryMovements;

use App\Actions\Configuration\InventorySettings\ResolveInventoryValidateStockAction;
use App\Enums\Store\InventoryMovementType;
use App\Models\Sale\SaleDocument;
use App\Models\Sale\SaleDocumentDetail;
use App\Models\Store\InventoryMovement;
use App\Models\Store\Product;
use App\Support\Store\GlobalMovementCategoryNames;
use App\Support\Store\InventoryMovementOrigin;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class DeductInventoryForSaleDocumentAction
{
    public function __construct(
        private CreateInventoryMovementAction $createInventoryMovement,
        private ResolveGlobalMovementCategoryAction $resolveGlobalMovementCategory,
        private ResolveInventoryValidateStockAction $resolveInventoryValidateStock,
        private HasUnreversedInventoryExitForOriginAction $hasUnreversedInventoryExitForOrigin,
    ) {}

    public function execute(SaleDocument $document, string $userId): ?InventoryMovement
    {
        return DB::transaction(function () use ($document, $userId): ?InventoryMovement {
            $existing = InventoryMovement::query()
                ->where('company_id', $document->company_id)
                ->where('type', InventoryMovementType::Exit)
                ->where('origin_type', InventoryMovementOrigin::SALE_DOCUMENT)
                ->where('origin_id', $document->id)
                ->whereDoesntHave('reversalMovement')
                ->first();

            if ($existing instanceof InventoryMovement) {
                return $existing;
            }

            $document->loadMissing('details');

            /** @var array<string, int> $quantitiesByProductId */
            $quantitiesByProductId = [];

            foreach ($document->details as $detail) {
                if (! $this->shouldDeductDetail($document->company_id, $detail)) {
                    continue;
                }

                $productId = (string) $detail->product_id;
                $quantitiesByProductId[$productId] = ($quantitiesByProductId[$productId] ?? 0)
                    + (int) $detail->quantity;
            }

            if ($quantitiesByProductId === []) {
                return null;
            }

            $validateStock = $this->resolveInventoryValidateStock->execute($document->company_id);
            $category = $this->resolveGlobalMovementCategory->execute(
                InventoryMovementType::Exit,
                GlobalMovementCategoryNames::SALE,
            );

            $details = [];
            foreach ($quantitiesByProductId as $productId => $quantity) {
                $details[] = [
                    'product_id' => $productId,
                    'quantity' => $quantity,
                ];
            }

            if ($validateStock) {
                $this->assertAggregatedStock($document->company_id, $quantitiesByProductId);
            }

            return $this->createInventoryMovement->execute([
                'company_id' => $document->company_id,
                'type' => InventoryMovementType::Exit->value,
                'moved_at' => now()->toDateString(),
                'movement_category_id' => $category->id,
                'user_id' => $userId,
                'details' => $details,
                'origin_type' => InventoryMovementOrigin::SALE_DOCUMENT,
                'origin_id' => $document->id,
                'validate_stock' => $validateStock,
            ]);
        });
    }

    private function shouldDeductDetail(string $companyId, SaleDocumentDetail $detail): bool
    {
        if ($detail->product_id === null || $detail->product_id === '') {
            return false;
        }

        $productExists = Product::query()
            ->whereKey($detail->product_id)
            ->where('company_id', $companyId)
            ->exists();

        if (! $productExists) {
            return false;
        }

        if (
            is_string($detail->patient_vaccination_dose_id)
            && $detail->patient_vaccination_dose_id !== ''
            && $this->hasUnreversedInventoryExitForOrigin->forVaccinationDose(
                $companyId,
                $detail->patient_vaccination_dose_id,
            )
        ) {
            return false;
        }

        return (int) $detail->quantity > 0;
    }

    /**
     * @param  array<string, int>  $quantitiesByProductId
     */
    private function assertAggregatedStock(string $companyId, array $quantitiesByProductId): void
    {
        $products = Product::query()
            ->where('company_id', $companyId)
            ->whereIn('id', array_keys($quantitiesByProductId))
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        foreach ($quantitiesByProductId as $productId => $quantity) {
            $product = $products->get($productId);

            if (! $product instanceof Product) {
                throw ValidationException::withMessages([
                    'details' => 'Uno o más productos de la venta no existen.',
                ]);
            }

            if ((int) $product->stock < $quantity) {
                throw ValidationException::withMessages([
                    'details' => "Stock insuficiente para «{$product->name}». Disponible: ".(int) $product->stock.'.',
                ]);
            }
        }
    }
}
