<?php

namespace App\Policies\Sale;

use App\Policies\Concerns\AuthorizesCompanyOwnedRecord;
use App\Support\Administration\ModulePermissionSlugs;

class SaleDocumentsPolicy
{
    use AuthorizesCompanyOwnedRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('sale.sale-documents')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('sale.sale-documents')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('sale.sale-documents')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('sale.sale-documents')->delete();
    }
}
