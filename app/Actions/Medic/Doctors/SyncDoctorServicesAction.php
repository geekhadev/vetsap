<?php

namespace App\Actions\Medic\Doctors;

use App\Models\Medic\Doctor;
use App\Models\Medic\Service;

final class SyncDoctorServicesAction
{
    /**
     * @param  list<array{service_id: string, duration_override_minutes: int|null}>  $services
     */
    public function execute(Doctor $doctor, array $services): void
    {
        $companyId = (string) $doctor->company_id;
        $syncData = [];

        foreach ($services as $row) {
            $serviceId = $row['service_id'];

            $valid = Service::query()
                ->forCompany($companyId)
                ->whereKey($serviceId)
                ->exists();

            if (! $valid) {
                continue;
            }

            $syncData[$serviceId] = [
                'duration_override_minutes' => $row['duration_override_minutes'],
            ];
        }

        $doctor->services()->sync($syncData);
    }
}
