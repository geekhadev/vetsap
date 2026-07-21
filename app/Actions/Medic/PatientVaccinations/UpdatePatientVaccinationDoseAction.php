<?php

namespace App\Actions\Medic\PatientVaccinations;

use App\Enums\Medic\VaccinationAdministeredOrigin;
use App\Enums\Medic\VaccinationDoseStatus;
use App\Models\Medic\PatientVaccinationDose;
use App\Support\Medic\VaccinationDoseSchedule;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

final class UpdatePatientVaccinationDoseAction
{
    public function __construct(
        private ShiftSubsequentVaccinationSeriesDosesAction $shiftSubsequentSeriesDoses,
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

            if ($seriesDeltaDays !== 0) {
                $this->shiftSubsequentSeriesDoses->execute($dose->fresh(), $seriesDeltaDays);
            }

            return $dose->refresh()->load('product:id,name');
        });
    }
}
