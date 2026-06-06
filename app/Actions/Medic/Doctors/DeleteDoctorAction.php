<?php

namespace App\Actions\Medic\Doctors;

use App\Models\Medic\Doctor;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

final class DeleteDoctorAction
{
    public function execute(Doctor $doctor): void
    {
        if (
            Schema::hasTable('agenda_appointments')
            && Schema::hasColumn('agenda_appointments', 'doctor_id')
            && Schema::hasColumn('agenda_appointments', 'status')
            && $doctor->newQuery()->getConnection()
                ->table('agenda_appointments')
                ->where('doctor_id', $doctor->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->exists()
        ) {
            throw ValidationException::withMessages([
                'first_name' => 'No se puede eliminar este doctor porque tiene citas pendientes o confirmadas. Desactívalo en su lugar.',
            ]);
        }

        $doctor->delete();
    }
}
