<?php

namespace App\Actions\Medic\Services;

use App\Models\Medic\Service;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

final class DeleteServiceAction
{
    public function execute(Service $service): void
    {
        if (
            Schema::hasTable('agenda_appointments')
            && Schema::hasColumn('agenda_appointments', 'service_id')
            && $service->newQuery()->getConnection()
                ->table('agenda_appointments')
                ->where('service_id', $service->id)
                ->exists()
        ) {
            throw ValidationException::withMessages([
                'name' => 'No se puede eliminar este servicio porque tiene citas asociadas. Desactívalo en su lugar.',
            ]);
        }

        $service->delete();
    }
}
