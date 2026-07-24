<?php

namespace App\Actions\Store\InventoryMovements;

use App\Enums\Store\InventoryMovementType;
use App\Models\Store\InventoryMovement;
use App\Support\Store\GlobalMovementCategoryNames;
use App\Support\Store\InventoryMovementOrigin;
use Illuminate\Support\Facades\DB;

final class ReverseInventoryMovementsForOriginAction
{
    public function __construct(
        private CreateInventoryMovementAction $createInventoryMovement,
        private ResolveGlobalMovementCategoryAction $resolveGlobalMovementCategory,
    ) {}

    public function execute(
        string $companyId,
        string $originType,
        string $originId,
        string $userId,
        string $entryCategoryName,
    ): void {
        DB::transaction(function () use ($companyId, $originType, $originId, $userId, $entryCategoryName): void {
            $exits = InventoryMovement::query()
                ->where('company_id', $companyId)
                ->where('type', InventoryMovementType::Exit)
                ->where('origin_type', $originType)
                ->where('origin_id', $originId)
                ->with('details')
                ->lockForUpdate()
                ->get();

            if ($exits->isEmpty()) {
                return;
            }

            $alreadyReversedIds = InventoryMovement::query()
                ->whereIn('reversed_movement_id', $exits->modelKeys())
                ->pluck('reversed_movement_id')
                ->all();

            $category = $this->resolveGlobalMovementCategory->execute(
                InventoryMovementType::Entry,
                $entryCategoryName,
            );

            foreach ($exits as $exit) {
                if (in_array($exit->id, $alreadyReversedIds, true)) {
                    continue;
                }

                $details = $exit->details
                    ->map(static fn ($detail): array => [
                        'product_id' => $detail->product_id,
                        'quantity' => (int) $detail->quantity,
                    ])
                    ->values()
                    ->all();

                if ($details === []) {
                    continue;
                }

                $this->createInventoryMovement->execute([
                    'company_id' => $companyId,
                    'type' => InventoryMovementType::Entry->value,
                    'moved_at' => now()->toDateString(),
                    'movement_category_id' => $category->id,
                    'user_id' => $userId,
                    'details' => $details,
                    'origin_type' => $originType,
                    'origin_id' => $originId,
                    'reversed_movement_id' => $exit->id,
                    'validate_stock' => false,
                ]);
            }
        });
    }

    public function forSaleDocument(string $companyId, string $saleDocumentId, string $userId): void
    {
        $this->execute(
            $companyId,
            InventoryMovementOrigin::SALE_DOCUMENT,
            $saleDocumentId,
            $userId,
            GlobalMovementCategoryNames::SALE_CANCELLATION,
        );
    }

    public function forVaccinationDose(string $companyId, string $doseId, string $userId): void
    {
        $this->execute(
            $companyId,
            InventoryMovementOrigin::PATIENT_VACCINATION_DOSE,
            $doseId,
            $userId,
            GlobalMovementCategoryNames::VACCINATION_CANCELLATION,
        );
    }
}
