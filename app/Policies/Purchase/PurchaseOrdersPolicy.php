<?php

namespace App\Policies\Purchase;

use App\Policies\Concerns\AuthorizesCompanyOwnedRecord;
use App\Support\Administration\ModulePermissionSlugs;

class PurchaseOrdersPolicy
{
    use AuthorizesCompanyOwnedRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.purchase-orders')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.purchase-orders')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.purchase-orders')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.purchase-orders')->delete();
    }
}
