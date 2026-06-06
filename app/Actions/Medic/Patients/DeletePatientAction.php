<?php

namespace App\Actions\Medic\Patients;

use App\Models\Medic\Patient;

final class DeletePatientAction
{
    public function execute(Patient $patient): void
    {
        $patient->delete();
    }
}
