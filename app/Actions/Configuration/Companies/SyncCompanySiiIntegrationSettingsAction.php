<?php

namespace App\Actions\Configuration\Companies;

use App\Models\Company;
use App\Models\CompanyIntegrationSetting;
use App\Support\Integration\CompanySiiIntegrationSettingKeys;

final class SyncCompanySiiIntegrationSettingsAction
{
    /**
     * @param  array<string, string|null>  $settings
     */
    public function execute(Company $company, array $settings): void
    {
        foreach (CompanySiiIntegrationSettingKeys::all() as $key) {
            $value = $settings[$key] ?? null;

            if ($value === null || $value === '') {
                CompanyIntegrationSetting::query()
                    ->where('company_id', $company->id)
                    ->where('key', $key)
                    ->delete();

                continue;
            }

            CompanyIntegrationSetting::query()->updateOrCreate(
                [
                    'company_id' => $company->id,
                    'key' => $key,
                ],
                [
                    'value' => (string) $value,
                ],
            );
        }
    }
}
