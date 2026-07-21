<?php

namespace App\Actions\Medic\PatientVaccinations;

use App\Enums\Medic\VaccinationDoseStatus;
use App\Models\Medic\PatientVaccinationDose;
use App\Support\Medic\VaccinationDoseSchedule;
use Carbon\CarbonImmutable;

/**
 * Desplaza las dosis abiertas posteriores de la misma serie.
 * Usado al aplicar tarde/temprano, al editar la fecha de aplicación o al revertirla.
 */
final class ShiftSubsequentVaccinationSeriesDosesAction
{
    public function execute(PatientVaccinationDose $anchorDose, int $deltaDays): void
    {
        if ($deltaDays === 0) {
            return;
        }

        $seriesKey = $anchorDose->series_key;

        if (! is_string($seriesKey) || $seriesKey === '' || $anchorDose->sequence < 1) {
            return;
        }

        $subsequent = PatientVaccinationDose::query()
            ->where('plan_id', $anchorDose->plan_id)
            ->where('series_key', $seriesKey)
            ->where('sequence', '>', $anchorDose->sequence)
            ->whereIn('status', [
                VaccinationDoseStatus::Scheduled,
                VaccinationDoseStatus::Due,
                VaccinationDoseStatus::Overdue,
            ])
            ->orderBy('sequence')
            ->get();

        foreach ($subsequent as $dose) {
            $newScheduled = CarbonImmutable::parse($dose->scheduled_on->toDateString())
                ->addDays($deltaDays);

            $dose->update([
                'scheduled_on' => $newScheduled->toDateString(),
                'status' => VaccinationDoseSchedule::openStatusForDate($newScheduled),
            ]);
        }
    }

    public static function signedDayDelta(CarbonImmutable $from, CarbonImmutable $to): int
    {
        return (int) $from->startOfDay()->diffInDays($to->startOfDay(), false);
    }
}
