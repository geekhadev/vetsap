<?php

namespace App\Support\Configuration;

final class InventorySettingKeys
{
    public const VALIDATE_STOCK_ON_SALES = 'inventory.validate_stock_on_sales';

    /**
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            self::VALIDATE_STOCK_ON_SALES,
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function defaults(): array
    {
        return [
            self::VALIDATE_STOCK_ON_SALES => '1',
        ];
    }
}
