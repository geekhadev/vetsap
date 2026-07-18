<?php

namespace App\Actions\Purchase\PurchaseOrderStatuses;

use App\Models\Purchase\PurchaseOrderStatus;

final class CreatePurchaseOrderStatusAction
{
    /**
     * @param  array{company_id: string, name: string, color: string, is_global: bool}  $data
     */
    public function execute(array $data): PurchaseOrderStatus
    {
        return PurchaseOrderStatus::query()->create($data);
    }
}
