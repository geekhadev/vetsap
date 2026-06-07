<?php

namespace App\Actions\Configuration\CompanySettings;

use App\Models\Company;
use App\Models\CompanySetting;

final class GetCompanySettingsAction
{
    /**
     * @param  list<string>  $keys
     * @return array<string, string|null>
     */
    public function execute(Company $company, array $keys): array
    {
        if ($keys === []) {
            return [];
        }

        $values = CompanySetting::query()
            ->where('company_id', $company->id)
            ->whereIn('key', $keys)
            ->pluck('value', 'key');

        $result = [];
        foreach ($keys as $key) {
            $result[$key] = isset($values[$key]) ? (string) $values[$key] : null;
        }

        return $result;
    }
}
