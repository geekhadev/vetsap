<?php

namespace App\Policies\Purchase;

use App\Policies\Concerns\AuthorizesCompanyOwnedRecord;
use App\Support\Administration\ModulePermissionSlugs;

class SuppliersPolicy
{
    use AuthorizesCompanyOwnedRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.suppliers')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.suppliers')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.suppliers')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.suppliers')->delete();
    }
}
