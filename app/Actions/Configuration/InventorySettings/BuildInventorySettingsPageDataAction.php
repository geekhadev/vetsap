<?php

namespace App\Actions\Configuration\InventorySettings;

use App\Actions\Configuration\CompanySettings\GetCompanySettingsAction;
use App\Models\Company;
use App\Support\Configuration\InventorySettingKeys;

final class BuildInventorySettingsPageDataAction
{
    public function __construct(
        private GetCompanySettingsAction $getCompanySettings,
    ) {}

    /**
     * @return array{
     *     settings: array{validate_stock_on_sales: bool},
     * }
     */
    public function execute(Company $company): array
    {
        $defaults = InventorySettingKeys::defaults();
        $stored = $this->getCompanySettings->execute($company, InventorySettingKeys::all());

        $value = $stored[InventorySettingKeys::VALIDATE_STOCK_ON_SALES]
            ?? $defaults[InventorySettingKeys::VALIDATE_STOCK_ON_SALES];

        return [
            'settings' => [
                'validate_stock_on_sales' => $value === '1',
            ],
        ];
    }
}
