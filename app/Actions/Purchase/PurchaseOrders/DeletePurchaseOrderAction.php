<?php

namespace App\Actions\Purchase\PurchaseOrders;

use App\Models\Purchase\PurchaseOrder;

final class DeletePurchaseOrderAction
{
    public function execute(PurchaseOrder $purchaseOrder): void
    {
        $purchaseOrder->delete();
    }
}
