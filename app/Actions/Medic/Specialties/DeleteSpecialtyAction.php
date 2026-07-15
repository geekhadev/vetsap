<?php

namespace App\Actions\Medic\Specialties;

use App\Models\Medic\Specialty;
use Illuminate\Validation\ValidationException;

final class DeleteSpecialtyAction
{
    public function execute(Specialty $specialty): void
    {
        if ($specialty->isGlobal()) {
            throw ValidationException::withMessages([
                'name' => 'No se puede eliminar una especialidad global del sistema.',
            ]);
        }

        if ($specialty->services()->exists()) {
            throw ValidationException::withMessages([
                'name' => 'No se puede eliminar esta especialidad porque tiene servicios asociados.',
            ]);
        }

        $specialty->delete();
    }
}
