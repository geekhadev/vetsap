<?php

namespace App\Support\Validation;

use App\Support\Store\StoreMasterRecordValidation;

final class ProductTypePayloadValidationRules
{
    /**
     * @return array<string, array<int, mixed|string>>
     */
    public static function storeRules(string $companyId): array
    {
        return [
            'name' => StoreMasterRecordValidation::nameRules('store_product_types', $companyId),
            'is_active' => StoreMasterRecordValidation::isActiveRules(),
        ];
    }

    /**
     * @return array<string, array<int, mixed|string>>
     */
    public static function updateRules(?string $companyId, string $id): array
    {
        return [
            'name' => StoreMasterRecordValidation::nameRules('store_product_types', $companyId, $id),
            'is_active' => StoreMasterRecordValidation::isActiveRules(),
        ];
    }
}
