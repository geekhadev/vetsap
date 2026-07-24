<?php

namespace App\Actions\Configuration\InventorySettings;

use App\Actions\Configuration\CompanySettings\GetCompanySettingsAction;
use App\Models\Company;
use App\Support\Configuration\InventorySettingKeys;

final class ResolveInventoryValidateStockAction
{
    public function __construct(
        private GetCompanySettingsAction $getCompanySettings,
    ) {}

    public function execute(Company|string $company): bool
    {
        $companyModel = $company instanceof Company
            ? $company
            : Company::query()->findOrFail($company);

        $defaults = InventorySettingKeys::defaults();
        $stored = $this->getCompanySettings->execute(
            $companyModel,
            InventorySettingKeys::all(),
        );

        $value = $stored[InventorySettingKeys::VALIDATE_STOCK_ON_SALES]
            ?? $defaults[InventorySettingKeys::VALIDATE_STOCK_ON_SALES];

        return $value === '1';
    }
}
