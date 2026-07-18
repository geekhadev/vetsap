<?php

namespace App\Actions\Purchase\PurchaseOrderStatuses;

use App\Models\Purchase\PurchaseOrderStatus;

final class DeletePurchaseOrderStatusAction
{
    public function execute(PurchaseOrderStatus $purchaseOrderStatus): void
    {
        $purchaseOrderStatus->delete();
    }
}
