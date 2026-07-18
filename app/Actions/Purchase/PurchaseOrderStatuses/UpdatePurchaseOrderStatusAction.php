<?php

namespace App\Actions\Purchase\PurchaseOrderStatuses;

use App\Models\Purchase\PurchaseOrderStatus;

final class UpdatePurchaseOrderStatusAction
{
    /**
     * @param  array{name: string, color: string}  $data
     */
    public function execute(PurchaseOrderStatus $purchaseOrderStatus, array $data): PurchaseOrderStatus
    {
        $purchaseOrderStatus->update($data);

        return $purchaseOrderStatus;
    }
}
