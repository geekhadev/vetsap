<?php

namespace App\Actions\Medic\Patients;

use App\Models\Medic\Patient;
use Illuminate\Support\Facades\Storage;

final class DeletePatientAction
{
    public function execute(Patient $patient): void
    {
        $photoPath = $patient->photo_path;

        $patient->delete();

        if (is_string($photoPath) && $photoPath !== '') {
            Storage::disk('public')->delete($photoPath);
        }
    }
}
