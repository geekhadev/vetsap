<?php

namespace App\Actions\Medic\Services;

use App\Actions\Configuration\CompanySettings\SyncCompanySettingsAction;
use App\Models\Company;
use App\Models\Medic\Service;
use App\Support\Configuration\CalendarSettingKeys;

final class SyncDefaultServiceSettingAction
{
    public function __construct(
        private SyncCompanySettingsAction $syncCompanySettings,
    ) {}

    public function execute(Company $company, ?string $defaultServiceId): void
    {
        $this->syncCompanySettings->execute(
            $company,
            [
                CalendarSettingKeys::DEFAULT_SERVICE_ID => $defaultServiceId ?? '',
            ],
            [CalendarSettingKeys::DEFAULT_SERVICE_ID],
        );
    }

    public function syncFromServiceFlags(Company $company): void
    {
        $defaultServiceId = Service::query()
            ->forCompany($company->id)
            ->where('is_default', true)
            ->value('id');

        $this->execute(
            $company,
            is_string($defaultServiceId) ? $defaultServiceId : null,
        );
    }
}
