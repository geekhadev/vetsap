<?php

namespace App\Actions\Medic\Species;

use App\Models\Medic\Species;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

final class DeleteSpeciesAction
{
    public function execute(Species $species): void
    {
        if ($species->isGlobal()) {
            throw ValidationException::withMessages([
                'name' => 'No se puede eliminar una especie global del sistema.',
            ]);
        }

        if (Schema::hasTable('medic_patients')
            && Schema::hasColumn('medic_patients', 'species_id')
            && DB::table('medic_patients')->where('species_id', $species->id)->exists()
        ) {
            throw ValidationException::withMessages([
                'name' => 'No se puede eliminar esta especie porque tiene pacientes asociados. Desactívala en su lugar.',
            ]);
        }

        $species->delete();
    }
}
