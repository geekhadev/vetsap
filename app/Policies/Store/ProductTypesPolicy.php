<?php

namespace App\Policies\Store;

use App\Policies\Store\Concerns\AuthorizesStoreMasterRecord;
use App\Support\Administration\ModulePermissionSlugs;

class ProductTypesPolicy
{
    use AuthorizesStoreMasterRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.product-types')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.product-types')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.product-types')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.product-types')->delete();
    }
}
