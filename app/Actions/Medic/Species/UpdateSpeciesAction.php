<?php

namespace App\Actions\Medic\Species;

use App\Models\Medic\Species;

final class UpdateSpeciesAction
{
    /**
     * @param  array{name: string, is_active: bool, sort_order?: int}  $data
     */
    public function execute(Species $species, array $data): Species
    {
        $species->update($data);

        return $species;
    }
}
