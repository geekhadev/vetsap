<?php

namespace App\Actions\Medic\Doctors;

use App\Models\Medic\Doctor;
use Illuminate\Validation\ValidationException;

final class DeleteDoctorAction
{
    public function execute(Doctor $doctor): void
    {
        if ($doctor->appointments()->blockingSchedule()->exists()) {
            throw ValidationException::withMessages([
                'first_name' => 'No se puede eliminar este doctor porque tiene citas activas en la agenda. Desactívalo en su lugar.',
            ]);
        }

        $doctor->delete();
    }
}
