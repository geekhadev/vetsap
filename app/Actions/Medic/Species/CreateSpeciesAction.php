<?php

namespace App\Actions\Medic\Species;

use App\Models\Medic\Species;

final class CreateSpeciesAction
{
    /**
     * @param  array{company_id: string, name: string, is_global: bool, is_active: bool}  $data
     */
    public function execute(array $data): Species
    {
        return Species::query()->create($data);
    }
}
