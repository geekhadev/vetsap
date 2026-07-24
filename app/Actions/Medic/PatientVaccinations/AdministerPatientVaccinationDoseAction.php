<?php

namespace App\Actions\Medic\PatientVaccinations;

use App\Actions\Store\InventoryMovements\DeductInventoryForVaccinationDoseAction;
use App\Enums\Medic\VaccinationAdministeredOrigin;
use App\Enums\Medic\VaccinationDoseStatus;
use App\Models\Medic\PatientVaccinationDose;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class AdministerPatientVaccinationDoseAction
{
    public function __construct(
        private ShiftSubsequentVaccinationSeriesDosesAction $shiftSubsequentSeriesDoses,
        private SyncVaccinationDoseToDraftSaleAction $syncVaccinationDoseToDraftSale,
        private CompleteAppointmentForVaccinationDoseAction $completeLinkedAppointment,
        private DeductInventoryForVaccinationDoseAction $deductInventoryForVaccinationDose,
    ) {}

    public function execute(
        PatientVaccinationDose $dose,
        CarbonImmutable $administeredOn,
        VaccinationAdministeredOrigin $origin,
        ?string $notes,
        ?string $recordedByUserId,
    ): PatientVaccinationDose {
        if (
            $dose->status === VaccinationDoseStatus::Administered
            || $dose->status === VaccinationDoseStatus::Omitted
        ) {
            return $dose;
        }

        return DB::transaction(function () use ($dose, $administeredOn, $origin, $notes, $recordedByUserId): PatientVaccinationDose {
            $scheduledOn = CarbonImmutable::parse($dose->scheduled_on->toDateString());
            $deltaDays = ShiftSubsequentVaccinationSeriesDosesAction::signedDayDelta(
                $scheduledOn,
                $administeredOn,
            );

            $dose->update([
                'status' => VaccinationDoseStatus::Administered,
                'administered_on' => $administeredOn,
                'administered_origin' => $origin,
                'notes' => $notes !== null && $notes !== '' ? $notes : $dose->notes,
                'recorded_by' => $recordedByUserId,
            ]);

            $fresh = $dose->fresh();

            if ($fresh instanceof PatientVaccinationDose) {
                $this->shiftSubsequentSeriesDoses->execute($fresh, $deltaDays);

                if ($origin === VaccinationAdministeredOrigin::Clinic) {
                    if (! is_string($recordedByUserId) || $recordedByUserId === '') {
                        throw ValidationException::withMessages([
                            'dose' => 'Se requiere un usuario autenticado para descontar inventario al aplicar la vacuna.',
                        ]);
                    }

                    $this->deductInventoryForVaccinationDose->execute($fresh, $recordedByUserId);
                    $this->syncVaccinationDoseToDraftSale->execute($fresh, $recordedByUserId);
                }

                $this->completeLinkedAppointment->execute($fresh, $recordedByUserId);
            }

            return $dose->refresh()->load(['product:id,name', 'appointment:id,starts_at']);
        });
    }
}
