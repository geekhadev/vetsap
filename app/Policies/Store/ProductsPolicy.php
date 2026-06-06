<?php

namespace App\Policies\Store;

use App\Policies\Concerns\AuthorizesCompanyOwnedRecord;
use App\Support\Administration\ModulePermissionSlugs;

class ProductsPolicy
{
    use AuthorizesCompanyOwnedRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.products')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.products')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.products')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.products')->delete();
    }
}
