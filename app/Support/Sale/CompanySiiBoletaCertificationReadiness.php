<?php

namespace App\Support\Sale;

use App\Models\Company;
use App\Support\Integration\CompanySiiIntegrationSettingKeys;

final class CompanySiiBoletaCertificationReadiness
{
    /**
     * @return array{ready: bool, missing_keys: list<string>}
     */
    public static function assess(Company $company): array
    {
        $required = [
            CompanySiiIntegrationSettingKeys::CITY,
            CompanySiiIntegrationSettingKeys::DIRECTION,
            CompanySiiIntegrationSettingKeys::REPRESENTANTE_LEGAL_RUT,
            CompanySiiIntegrationSettingKeys::REPRESENTANTE_LEGAL_NAME,
            CompanySiiIntegrationSettingKeys::CERTIFICATE_URL,
            CompanySiiIntegrationSettingKeys::CERTIFICATE_PASSWORD,
            CompanySiiIntegrationSettingKeys::GIRO,
            CompanySiiIntegrationSettingKeys::ACTECO,
            CompanySiiIntegrationSettingKeys::RESOLUTION_DATE_TICKETS,
            CompanySiiIntegrationSettingKeys::RESOLUTION_NUMBER_TICKETS,
        ];

        $settings = $company->integrationSettings()
            ->whereIn('key', $required)
            ->pluck('value', 'key');

        $missing = [];

        foreach ($required as $key) {
            $value = $settings->get($key);
            if (! is_string($value) || trim($value) === '') {
                $missing[] = $key;
            }
        }

        return [
            'ready' => $missing === [],
            'missing_keys' => $missing,
        ];
    }
}
