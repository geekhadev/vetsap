<?php

namespace App\Policies\Purchase;

use App\Policies\Concerns\AuthorizesCompanyOwnedRecord;
use App\Support\Administration\ModulePermissionSlugs;

class ExpensesPolicy
{
    use AuthorizesCompanyOwnedRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.expenses')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.expenses')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.expenses')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.expenses')->delete();
    }
}
