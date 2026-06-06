<?php

namespace App\Actions\Medic\Services;

use App\Models\Medic\Service;
use Illuminate\Validation\ValidationException;

final class DeleteServiceAction
{
    public function execute(Service $service): void
    {
        if ($service->appointments()->exists()) {
            throw ValidationException::withMessages([
                'name' => 'No se puede eliminar este servicio porque tiene citas asociadas. Desactívalo en su lugar.',
            ]);
        }

        $service->delete();
    }
}
