<?php

namespace App\Actions\Medic\Services;

use App\Models\Medic\Service;

final class UpdateServiceAction
{
    /**
     * @param  array{
     *     specialty_id: string,
     *     name: string,
     *     description: string|null,
     *     price: string|null,
     *     duration_minutes: int|null,
     *     is_active: bool
     * }  $data
     */
    public function execute(Service $service, array $data): Service
    {
        $service->update($data);

        return $service;
    }
}
