<?php

namespace App\Actions\Store\InventoryMovements;

use App\Enums\Store\InventoryMovementType;
use App\Models\Store\InventoryMovement;
use App\Support\Store\InventoryMovementOrigin;

final class HasUnreversedInventoryExitForOriginAction
{
    public function execute(string $companyId, string $originType, string $originId): bool
    {
        $exitIds = InventoryMovement::query()
            ->where('company_id', $companyId)
            ->where('type', InventoryMovementType::Exit)
            ->where('origin_type', $originType)
            ->where('origin_id', $originId)
            ->pluck('id');

        if ($exitIds->isEmpty()) {
            return false;
        }

        $reversedExitIds = InventoryMovement::query()
            ->whereIn('reversed_movement_id', $exitIds)
            ->pluck('reversed_movement_id')
            ->all();

        foreach ($exitIds as $exitId) {
            if (! in_array($exitId, $reversedExitIds, true)) {
                return true;
            }
        }

        return false;
    }

    public function forVaccinationDose(string $companyId, string $doseId): bool
    {
        return $this->execute(
            $companyId,
            InventoryMovementOrigin::PATIENT_VACCINATION_DOSE,
            $doseId,
        );
    }
}
