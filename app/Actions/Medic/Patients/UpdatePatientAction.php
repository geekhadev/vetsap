<?php

namespace App\Actions\Medic\Patients;

use App\Enums\Medic\PatientSex;
use App\Models\Medic\Patient;

final class UpdatePatientAction
{
    /**
     * @param  array{
     *     customer_id: string,
     *     species_id: string,
     *     record_number: string,
     *     name: string,
     *     breed: string|null,
     *     sex: PatientSex,
     *     birth_date: string|null,
     *     weight_kg: string|null,
     *     is_sterilized: bool,
     *     colors: string|null,
     *     blood_type: string|null,
     *     microchip_number: string|null,
     *     is_active: bool
     * }  $data
     */
    public function execute(Patient $patient, array $data): Patient
    {
        $patient->update($data);

        return $patient->refresh();
    }
}
