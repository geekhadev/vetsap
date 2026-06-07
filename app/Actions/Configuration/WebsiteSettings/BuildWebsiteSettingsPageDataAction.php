<?php

namespace App\Actions\Configuration\WebsiteSettings;

use App\Models\Company;
use App\Support\Storage\PublicStorageUrl;
use App\Support\Web\ClinicWebSettingKeys;

final class BuildWebsiteSettingsPageDataAction
{
    /**
     * @return array{
     *     companyId: string,
     *     slug: string|null,
     *     webSettings: array<string, string|null>,
     * }
     */
    public function execute(Company $company): array
    {
        return [
            'companyId' => $company->id,
            'slug' => $company->slug,
            'webSettings' => $this->webSettingsFormProps($company),
        ];
    }

    /**
     * @return array<string, string|null>
     */
    private function webSettingsFormProps(Company $company): array
    {
        $keys = ClinicWebSettingKeys::PANEL_TEXT_KEYS;
        $values = $company->webSettings()
            ->whereIn('key', $keys)
            ->pluck('value', 'key');

        $result = [];
        foreach ($keys as $key) {
            $result[$key] = $values[$key] ?? null;
        }

        $logoSetting = $company->webSettings()->where('key', ClinicWebSettingKeys::LOGO)->first();
        $result[ClinicWebSettingKeys::LOGO] = PublicStorageUrl::fromRelativePath($logoSetting?->value);

        return $result;
    }
}
