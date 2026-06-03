<?php

namespace App\Actions\Web;

use App\Models\Company;
use App\Models\Web\ClinicWebSetting;
use App\Support\Web\ClinicWebSettingKeys;

class SyncClinicTextWebSettingsAction
{
    /**
     * Upserts a set of text/html key-value settings for a company.
     * Deletes the row if value is null or empty string.
     *
     * @param  array<string, string|null>  $settings  key → value
     */
    public function execute(Company $company, array $settings): void
    {
        $typeMap = ClinicWebSettingKeys::typeMap();

        foreach ($settings as $key => $value) {
            if (! isset($typeMap[$key])) {
                continue;
            }

            if ($value === null || $value === '') {
                ClinicWebSetting::query()
                    ->where('company_id', $company->id)
                    ->where('key', $key)
                    ->delete();

                continue;
            }

            ClinicWebSetting::query()->updateOrCreate(
                ['company_id' => $company->id, 'key' => $key],
                ['type' => $typeMap[$key], 'value' => $value],
            );
        }
    }
}
