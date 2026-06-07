<?php

namespace App\Actions\Configuration\CompanySettings;

use App\Models\Company;
use App\Models\CompanySetting;

final class SyncCompanySettingsAction
{
    /**
     * @param  array<string, string|null>  $settings
     * @param  list<string>  $allowedKeys
     */
    public function execute(Company $company, array $settings, array $allowedKeys): void
    {
        foreach ($allowedKeys as $key) {
            $value = $settings[$key] ?? null;

            if ($value === null || $value === '') {
                CompanySetting::query()
                    ->where('company_id', $company->id)
                    ->where('key', $key)
                    ->delete();

                continue;
            }

            CompanySetting::query()->updateOrCreate(
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
