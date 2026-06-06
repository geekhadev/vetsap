<?php

namespace App\Policies\Sale;

use App\Policies\Concerns\AuthorizesCompanyOwnedRecord;
use App\Support\Administration\ModulePermissionSlugs;

class CustomersPolicy
{
    use AuthorizesCompanyOwnedRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('sale.customers')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('sale.customers')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('sale.customers')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('sale.customers')->delete();
    }
}
