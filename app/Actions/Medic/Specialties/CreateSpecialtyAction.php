<?php

namespace App\Actions\Medic\Specialties;

use App\Models\Medic\Specialty;

final class CreateSpecialtyAction
{
    /**
     * @param  array{company_id: string, name: string, description: string|null, icon: string|null, is_active: bool}  $data
     */
    public function execute(array $data): Specialty
    {
        $nextSortOrder = (int) Specialty::query()
            ->forCompany($data['company_id'])
            ->max('sort_order') + 1;

        $data['sort_order'] = $nextSortOrder;

        return Specialty::query()->create($data);
    }
}
