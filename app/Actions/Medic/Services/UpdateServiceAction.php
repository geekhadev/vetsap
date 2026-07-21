<?php

namespace App\Actions\Medic\Services;

use App\Models\Company;
use App\Models\Medic\Service;
use Illuminate\Support\Facades\DB;

final class UpdateServiceAction
{
    public function __construct(
        private SyncDefaultServiceSettingAction $syncDefaultServiceSetting,
    ) {}

    /**
     * @param  array{
     *     specialty_id: string,
     *     name: string,
     *     description: string|null,
     *     price: string|null,
     *     duration_minutes: int|null,
     *     is_active: bool,
     *     use_web: bool,
     *     is_default: bool
     * }  $data
     */
    public function execute(Service $service, array $data): Service
    {
        return DB::transaction(function () use ($service, $data): Service {
            if ($data['is_default']) {
                Service::clearOtherDefaults($service->company_id, $service->id);
            }

            $service->update($data);

            $company = Company::query()->find($service->company_id);
            if ($company instanceof Company) {
                $this->syncDefaultServiceSetting->syncFromServiceFlags($company);
            }

            return $service;
        });
    }
}
