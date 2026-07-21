<?php

namespace App\Actions\Medic\PatientVaccinations;

use App\Enums\Medic\VaccinationDoseStatus;
use App\Models\Medic\PatientVaccinationDose;

final class OmitPatientVaccinationDoseAction
{
    public function execute(
        PatientVaccinationDose $dose,
        ?string $notes,
        ?string $recordedByUserId,
    ): PatientVaccinationDose {
        if ($dose->status === VaccinationDoseStatus::Administered) {
            return $dose;
        }

        $dose->update([
            'status' => VaccinationDoseStatus::Omitted,
            'administered_on' => null,
            'administered_origin' => null,
            'notes' => $notes !== null && $notes !== '' ? $notes : $dose->notes,
            'recorded_by' => $recordedByUserId,
        ]);

        return $dose->refresh()->load('product:id,name');
    }
}
