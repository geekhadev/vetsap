<?php

namespace App\Actions\Medic\PatientVaccinations;

use App\Actions\Store\InventoryMovements\ReverseInventoryMovementsForOriginAction;
use App\Enums\Medic\VaccinationDoseStatus;
use App\Models\Medic\PatientVaccinationDose;
use App\Support\Medic\VaccinationDoseSchedule;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class ClearPatientVaccinationDoseAdministrationAction
{
    public function __construct(
        private ShiftSubsequentVaccinationSeriesDosesAction $shiftSubsequentSeriesDoses,
        private ReverseInventoryMovementsForOriginAction $reverseInventoryMovementsForOrigin,
    ) {}

    public function execute(
        PatientVaccinationDose $dose,
        ?string $recordedByUserId,
    ): PatientVaccinationDose {
        if ($dose->status !== VaccinationDoseStatus::Administered) {
            return $dose;
        }

        return DB::transaction(function () use ($dose, $recordedByUserId): PatientVaccinationDose {
            $dose->loadMissing(['plan:id,company_id']);
            $companyId = $dose->plan?->company_id;

            if (
                is_string($companyId)
                && $companyId !== ''
                && is_string($recordedByUserId)
                && $recordedByUserId !== ''
            ) {
                $this->reverseInventoryMovementsForOrigin->forVaccinationDose(
                    $companyId,
                    $dose->id,
                    $recordedByUserId,
                );
            } elseif (
                is_string($companyId)
                && $companyId !== ''
                && (! is_string($recordedByUserId) || $recordedByUserId === '')
            ) {
                throw ValidationException::withMessages([
                    'dose' => 'Se requiere un usuario autenticado para revertir el inventario de la vacuna.',
                ]);
            }

            $scheduledOn = CarbonImmutable::parse($dose->scheduled_on->toDateString());
            $administeredOn = $dose->administered_on !== null
                ? CarbonImmutable::parse($dose->administered_on->toDateString())
                : null;

            $seriesDeltaDays = $administeredOn instanceof CarbonImmutable
                ? ShiftSubsequentVaccinationSeriesDosesAction::signedDayDelta(
                    $administeredOn,
                    $scheduledOn,
                )
                : 0;

            $dose->update([
                'status' => VaccinationDoseSchedule::openStatusForDate($scheduledOn),
                'administered_on' => null,
                'administered_origin' => null,
                'recorded_by' => $recordedByUserId,
            ]);

            if ($seriesDeltaDays !== 0) {
                $this->shiftSubsequentSeriesDoses->execute($dose->fresh(), $seriesDeltaDays);
            }

            return $dose->refresh()->load('product:id,name');
        });
    }
}
