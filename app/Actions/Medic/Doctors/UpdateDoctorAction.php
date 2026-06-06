<?php

namespace App\Actions\Medic\Doctors;

use App\Models\Medic\Doctor;

final class UpdateDoctorAction
{
    public function __construct(
        private SyncDoctorServicesAction $syncServices,
    ) {}

    /**
     * @param  array{
     *     first_name: string,
     *     last_name: string,
     *     phone: string|null,
     *     email: string|null,
     *     is_active: bool,
     *     use_web: bool
     * }  $data
     * @param  list<array{service_id: string, duration_override_minutes: int|null}>|null  $services
     */
    public function execute(Doctor $doctor, array $data, ?array $services = null): Doctor
    {
        $doctor->update($data);

        if ($services !== null) {
            $this->syncServices->execute($doctor, $services);
            $doctor->load([
                'services' => fn ($query) => $query
                    ->select('medic_services.id', 'medic_services.name', 'medic_services.duration_minutes'),
            ]);
        }

        return $doctor;
    }
}
