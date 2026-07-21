<?php

namespace App\Actions\Medic\PatientVaccinations;

use App\Enums\Medic\VaccinationAdministeredOrigin;
use App\Enums\Medic\VaccinationDoseStatus;
use App\Models\Medic\PatientVaccinationDose;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

final class AdministerPatientVaccinationDoseAction
{
    public function __construct(
        private ShiftSubsequentVaccinationSeriesDosesAction $shiftSubsequentSeriesDoses,
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

            $this->shiftSubsequentSeriesDoses->execute($dose->fresh(), $deltaDays);

            return $dose->refresh()->load('product:id,name');
        });
    }
}
