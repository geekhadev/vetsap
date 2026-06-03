<?php

namespace App\Actions\Medic\Species;

use App\Models\Medic\Species;

final class CreateSpeciesAction
{
    /**
     * @param  array{company_id: string, name: string, is_active: bool}  $data
     */
    public function execute(array $data): Species
    {
        $nextSortOrder = (int) Species::query()
            ->forCompany($data['company_id'])
            ->max('sort_order') + 1;

        $data['sort_order'] = $nextSortOrder;

        return Species::query()->create($data);
    }
}
