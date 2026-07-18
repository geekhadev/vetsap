<?php

namespace App\Policies\Purchase;

use App\Policies\Purchase\Concerns\AuthorizesPurchaseMasterRecord;
use App\Support\Administration\ModulePermissionSlugs;

class ExpenseTypesPolicy
{
    use AuthorizesPurchaseMasterRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.expense-types')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.expense-types')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.expense-types')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('purchase.expense-types')->delete();
    }
}
