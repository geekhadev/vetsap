<?php

namespace App\Actions\Medic\Services;

use App\Models\Medic\Service;

final class CreateServiceAction
{
    /**
     * @param  array{
     *     company_id: string,
     *     specialty_id: string,
     *     name: string,
     *     description: string|null,
     *     price: string|null,
     *     duration_minutes: int|null,
     *     is_active: bool
     * }  $data
     */
    public function execute(array $data): Service
    {
        return Service::query()->create($data);
    }
}
