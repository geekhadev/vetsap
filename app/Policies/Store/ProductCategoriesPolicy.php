<?php

namespace App\Policies\Store;

use App\Policies\Store\Concerns\AuthorizesStoreMasterRecord;
use App\Support\Administration\ModulePermissionSlugs;

class ProductCategoriesPolicy
{
    use AuthorizesStoreMasterRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.product-categories')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.product-categories')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.product-categories')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.product-categories')->delete();
    }
}
