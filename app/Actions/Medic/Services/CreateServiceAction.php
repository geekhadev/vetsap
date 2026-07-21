<?php

namespace App\Actions\Medic\Services;

use App\Models\Company;
use App\Models\Medic\Service;
use Illuminate\Support\Facades\DB;

final class CreateServiceAction
{
    public function __construct(
        private SyncDefaultServiceSettingAction $syncDefaultServiceSetting,
    ) {}

    /**
     * @param  array{
     *     company_id: string,
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
    public function execute(array $data): Service
    {
        return DB::transaction(function () use ($data): Service {
            $isFirstService = ! Service::query()
                ->forCompany($data['company_id'])
                ->exists();

            if ($isFirstService) {
                $data['is_default'] = true;
            }

            if ($data['is_default']) {
                Service::clearOtherDefaults($data['company_id']);
            }

            /** @var Service $service */
            $service = Service::query()->create($data);

            $company = Company::query()->find($service->company_id);
            if ($company instanceof Company) {
                $this->syncDefaultServiceSetting->syncFromServiceFlags($company);
            }

            return $service;
        });
    }
}
