<?php

namespace App\Actions\Medic\Doctors;

use App\Enums\Medic\DoctorDocumentType;
use App\Models\Medic\Doctor;

final class CreateDoctorAction
{
    /**
     * @param  array{
     *     company_id: string,
     *     document_type: DoctorDocumentType,
     *     document_number: string,
     *     first_name: string,
     *     last_name: string,
     *     phone: string|null,
     *     email: string|null,
     *     is_active: bool,
     *     use_web: bool
     * }  $data
     */
    public function execute(array $data): Doctor
    {
        return Doctor::query()->create($data);
    }
}
