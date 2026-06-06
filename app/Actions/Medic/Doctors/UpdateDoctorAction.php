<?php

namespace App\Actions\Medic\Doctors;

use App\Models\Medic\Doctor;

final class UpdateDoctorAction
{
    /**
     * @param  array{
     *     first_name: string,
     *     last_name: string,
     *     phone: string|null,
     *     email: string|null,
     *     is_active: bool,
     *     use_web: bool
     * }  $data
     */
    public function execute(Doctor $doctor, array $data): Doctor
    {
        $doctor->update($data);

        return $doctor;
    }
}
