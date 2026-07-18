<?php

namespace App\Policies\Purchase;

use App\Policies\Purchase\Concerns\AuthorizesPurchaseMasterRecord;
use App\Support\Administration\ModulePermissionSlugs;

class PurchaseOrderStatusPolicy
{
    use AuthorizesPurchaseMasterRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.purchase-order-statuses')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.purchase-order-statuses')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.purchase-order-statuses')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.purchase-order-statuses')->delete();
    }
}
