<?php

namespace App\Actions\Medic\Species;

use App\Models\Medic\Species;
use Illuminate\Validation\ValidationException;

final class UpdateSpeciesAction
{
    /**
     * @param  array{name: string, is_active: bool}  $data
     */
    public function execute(Species $species, array $data): Species
    {
        if ($species->isGlobal()) {
            throw ValidationException::withMessages([
                'name' => 'No se puede editar una especie global del sistema.',
            ]);
        }

        $species->update($data);

        return $species;
    }
}
