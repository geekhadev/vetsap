<?php

namespace App\Actions\Medic\PatientVaccinations;

use App\Actions\Store\InventoryMovements\DeductInventoryForVaccinationDoseAction;
use App\Actions\Store\InventoryMovements\ReverseInventoryMovementsForOriginAction;
use App\Enums\Medic\VaccinationAdministeredOrigin;
use App\Enums\Medic\VaccinationDoseStatus;
use App\Models\Medic\PatientVaccinationDose;
use App\Support\Medic\VaccinationDoseSchedule;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

final class UpdatePatientVaccinationDoseAction
{
    public function __construct(
        private ShiftSubsequentVaccinationSeriesDosesAction $shiftSubsequentSeriesDoses,
        private SyncVaccinationDoseToDraftSaleAction $syncVaccinationDoseToDraftSale,
        private DeductInventoryForVaccinationDoseAction $deductInventoryForVaccinationDose,
        private ReverseInventoryMovementsForOriginAction $reverseInventoryMovementsForOrigin,
    ) {}

    public function execute(
        PatientVaccinationDose $dose,
        CarbonImmutable $scheduledOn,
        ?CarbonImmutable $administeredOn,
        ?VaccinationAdministeredOrigin $origin,
        ?string $notes,
        ?string $recordedByUserId,
    ): PatientVaccinationDose {
        return DB::transaction(function () use (
            $dose,
            $scheduledOn,
            $administeredOn,
            $origin,
            $notes,
            $recordedByUserId,
        ): PatientVaccinationDose {
            $previousOrigin = $dose->administered_origin;

            $payload = [
                'scheduled_on' => $scheduledOn->toDateString(),
                'notes' => $notes !== null && $notes !== '' ? $notes : null,
                'recorded_by' => $recordedByUserId,
            ];

            $seriesDeltaDays = 0;

            if ($dose->status === VaccinationDoseStatus::Administered) {
                if ($administeredOn === null || $origin === null) {
                    throw new InvalidArgumentException('La dosis aplicada requiere fecha y origen.');
                }

                $previousAdministeredOn = $dose->administered_on !== null
                    ? CarbonImmutable::parse($dose->administered_on->toDateString())
                    : null;

                if (
                    $previousAdministeredOn instanceof CarbonImmutable
                    && ! $previousAdministeredOn->equalTo($administeredOn->startOfDay())
                ) {
                    $seriesDeltaDays = ShiftSubsequentVaccinationSeriesDosesAction::signedDayDelta(
                        $previousAdministeredOn,
                        $administeredOn,
                    );
                }

                $payload['administered_on'] = $administeredOn->startOfDay();
                $payload['administered_origin'] = $origin;
            } elseif (
                $dose->status === VaccinationDoseStatus::Scheduled
                || $dose->status === VaccinationDoseStatus::Due
                || $dose->status === VaccinationDoseStatus::Overdue
            ) {
                $previousScheduledOn = CarbonImmutable::parse($dose->scheduled_on->toDateString());

                if (! $previousScheduledOn->equalTo($scheduledOn->startOfDay())) {
                    $seriesDeltaDays = ShiftSubsequentVaccinationSeriesDosesAction::signedDayDelta(
                        $previousScheduledOn,
                        $scheduledOn,
                    );
                }

                $payload['status'] = VaccinationDoseSchedule::openStatusForDate($scheduledOn);
                $payload['administered_on'] = null;
                $payload['administered_origin'] = null;
            }

            $dose->update($payload);

            $fresh = $dose->fresh();

            if ($fresh instanceof PatientVaccinationDose && $seriesDeltaDays !== 0) {
                $this->shiftSubsequentSeriesDoses->execute($fresh, $seriesDeltaDays);
            }

            if ($fresh instanceof PatientVaccinationDose) {
                $this->syncInventoryForOriginChange(
                    $fresh,
                    $previousOrigin,
                    $recordedByUserId,
                );
            }

            if (
                $fresh instanceof PatientVaccinationDose
                && $fresh->status === VaccinationDoseStatus::Administered
                && $fresh->administered_origin === VaccinationAdministeredOrigin::Clinic
            ) {
                $this->syncVaccinationDoseToDraftSale->execute($fresh, $recordedByUserId);
            }

            return $dose->refresh()->load(['product:id,name', 'appointment:id,starts_at']);
        });
    }

    private function syncInventoryForOriginChange(
        PatientVaccinationDose $dose,
        ?VaccinationAdministeredOrigin $previousOrigin,
        ?string $recordedByUserId,
    ): void {
        $becameClinic = $previousOrigin !== VaccinationAdministeredOrigin::Clinic
            && $dose->administered_origin === VaccinationAdministeredOrigin::Clinic
            && $dose->status === VaccinationDoseStatus::Administered;

        $leftClinic = $previousOrigin === VaccinationAdministeredOrigin::Clinic
            && $dose->administered_origin !== VaccinationAdministeredOrigin::Clinic;

        if (! $becameClinic && ! $leftClinic) {
            return;
        }

        if (! is_string($recordedByUserId) || $recordedByUserId === '') {
            throw ValidationException::withMessages([
                'dose' => 'Se requiere un usuario autenticado para actualizar el inventario de la vacuna.',
            ]);
        }

        if ($becameClinic) {
            $this->deductInventoryForVaccinationDose->execute($dose, $recordedByUserId);

            return;
        }

        $dose->loadMissing(['plan:id,company_id']);
        $companyId = $dose->plan?->company_id;

        if (! is_string($companyId) || $companyId === '') {
            return;
        }

        $this->reverseInventoryMovementsForOrigin->forVaccinationDose(
            $companyId,
            $dose->id,
            $recordedByUserId,
        );
    }
}
