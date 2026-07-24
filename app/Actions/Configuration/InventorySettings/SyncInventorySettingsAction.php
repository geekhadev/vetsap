<?php

namespace App\Actions\Configuration\InventorySettings;

use App\Actions\Configuration\CompanySettings\SyncCompanySettingsAction;
use App\Models\Company;
use App\Support\Configuration\InventorySettingKeys;

final class SyncInventorySettingsAction
{
    public function __construct(
        private SyncCompanySettingsAction $syncCompanySettings,
    ) {}

    /**
     * @param  array{validate_stock_on_sales: bool}  $payload
     */
    public function execute(Company $company, array $payload): void
    {
        $this->syncCompanySettings->execute(
            $company,
            [
                InventorySettingKeys::VALIDATE_STOCK_ON_SALES => $payload['validate_stock_on_sales'] ? '1' : '0',
            ],
            InventorySettingKeys::all(),
        );
    }
}
