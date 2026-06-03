<?php

namespace App\Actions\Medic\Specialties;

use App\Models\Medic\Specialty;
use Illuminate\Validation\ValidationException;

final class UpdateSpecialtyAction
{
    /**
     * @param  array{name: string, description: string|null, icon: string|null, is_active: bool, sort_order?: int}  $data
     */
    public function execute(Specialty $specialty, array $data): Specialty
    {
        $deactivating = $specialty->is_active && ! $data['is_active'];

        if ($deactivating && $specialty->services()->where('is_active', true)->exists()) {
            throw ValidationException::withMessages([
                'is_active' => 'No se puede desactivar esta especialidad porque tiene servicios activos asociados.',
            ]);
        }

        $specialty->update($data);

        return $specialty;
    }
}
