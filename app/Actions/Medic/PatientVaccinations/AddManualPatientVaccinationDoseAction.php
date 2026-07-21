<?php

namespace App\Actions\Medic\PatientVaccinations;

use App\Enums\Medic\VaccinationDoseSource;
use App\Models\Medic\PatientVaccinationDose;
use App\Models\Medic\PatientVaccinationPlan;
use App\Support\Medic\VaccinationDoseSchedule;
use Carbon\CarbonImmutable;

final class AddManualPatientVaccinationDoseAction
{
    public function execute(
        PatientVaccinationPlan $plan,
        string $productId,
        CarbonImmutable $scheduledOn,
        ?string $notes,
        ?string $recordedByUserId,
    ): PatientVaccinationDose {
        $status = VaccinationDoseSchedule::openStatusForDate($scheduledOn);

        /** @var PatientVaccinationDose $dose */
        $dose = $plan->doses()->create([
            'product_id' => $productId,
            'series_key' => null,
            'sequence' => 0,
            'scheduled_on' => $scheduledOn->toDateString(),
            'administered_on' => null,
            'status' => $status,
            'administered_origin' => null,
            'source' => VaccinationDoseSource::Manual,
            'notes' => $notes !== null && $notes !== '' ? $notes : null,
            'recorded_by' => $recordedByUserId,
        ]);

        return $dose->load('product:id,name');
    }
}
