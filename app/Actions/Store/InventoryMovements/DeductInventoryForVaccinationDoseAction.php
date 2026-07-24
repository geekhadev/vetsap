<?php

namespace App\Actions\Store\InventoryMovements;

use App\Actions\Configuration\InventorySettings\ResolveInventoryValidateStockAction;
use App\Enums\Medic\VaccinationAdministeredOrigin;
use App\Enums\Store\InventoryMovementType;
use App\Models\Medic\PatientVaccinationDose;
use App\Models\Store\InventoryMovement;
use App\Models\Store\Product;
use App\Support\Store\GlobalMovementCategoryNames;
use App\Support\Store\InventoryMovementOrigin;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class DeductInventoryForVaccinationDoseAction
{
    public function __construct(
        private CreateInventoryMovementAction $createInventoryMovement,
        private ResolveGlobalMovementCategoryAction $resolveGlobalMovementCategory,
        private ResolveInventoryValidateStockAction $resolveInventoryValidateStock,
        private HasUnreversedInventoryExitForOriginAction $hasUnreversedInventoryExitForOrigin,
    ) {}

    public function execute(PatientVaccinationDose $dose, string $userId): ?InventoryMovement
    {
        if ($dose->administered_origin !== VaccinationAdministeredOrigin::Clinic) {
            return null;
        }

        if ($dose->product_id === null || $dose->product_id === '') {
            return null;
        }

        $dose->loadMissing(['plan:id,company_id']);
        $companyId = $dose->plan?->company_id;

        if (! is_string($companyId) || $companyId === '') {
            throw ValidationException::withMessages([
                'dose' => 'No se pudo resolver la clínica de la dosis de vacunación.',
            ]);
        }

        return DB::transaction(function () use ($dose, $userId, $companyId): ?InventoryMovement {
            if ($this->hasUnreversedInventoryExitForOrigin->forVaccinationDose($companyId, $dose->id)) {
                return InventoryMovement::query()
                    ->where('company_id', $companyId)
                    ->where('type', InventoryMovementType::Exit)
                    ->where('origin_type', InventoryMovementOrigin::PATIENT_VACCINATION_DOSE)
                    ->where('origin_id', $dose->id)
                    ->whereDoesntHave('reversalMovement')
                    ->latest('created_at')
                    ->first();
            }

            $product = Product::query()
                ->whereKey($dose->product_id)
                ->where('company_id', $companyId)
                ->lockForUpdate()
                ->first();

            if (! $product instanceof Product) {
                throw ValidationException::withMessages([
                    'product_id' => 'El producto de la vacuna no existe en el inventario de la clínica.',
                ]);
            }

            $validateStock = $this->resolveInventoryValidateStock->execute($companyId);
            $category = $this->resolveGlobalMovementCategory->execute(
                InventoryMovementType::Exit,
                GlobalMovementCategoryNames::VACCINATION,
            );

            return $this->createInventoryMovement->execute([
                'company_id' => $companyId,
                'type' => InventoryMovementType::Exit->value,
                'moved_at' => ($dose->administered_on?->toDateString()) ?? now()->toDateString(),
                'movement_category_id' => $category->id,
                'user_id' => $userId,
                'details' => [
                    [
                        'product_id' => $product->id,
                        'quantity' => 1,
                    ],
                ],
                'origin_type' => InventoryMovementOrigin::PATIENT_VACCINATION_DOSE,
                'origin_id' => $dose->id,
                'validate_stock' => $validateStock,
            ]);
        });
    }
}
