<?php

namespace App\Actions\Medic\Specialties;

use App\Models\Medic\Specialty;

final class CreateSpecialtyAction
{
    /**
     * @param  array{company_id: string, name: string, description: string|null, is_global: bool, is_active: bool}  $data
     */
    public function execute(array $data): Specialty
    {
        return Specialty::query()->create($data);
    }
}
