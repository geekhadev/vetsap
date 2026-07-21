<?php

namespace App\Actions\Medic\PatientVaccinations;

use App\Enums\Medic\VaccinationDoseStatus;
use App\Models\Medic\PatientVaccinationDose;
use App\Support\Medic\VaccinationDoseSchedule;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

final class ClearPatientVaccinationDoseAdministrationAction
{
    public function __construct(
        private ShiftSubsequentVaccinationSeriesDosesAction $shiftSubsequentSeriesDoses,
    ) {}

    public function execute(
        PatientVaccinationDose $dose,
        ?string $recordedByUserId,
    ): PatientVaccinationDose {
        if ($dose->status !== VaccinationDoseStatus::Administered) {
            return $dose;
        }

        return DB::transaction(function () use ($dose, $recordedByUserId): PatientVaccinationDose {
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
