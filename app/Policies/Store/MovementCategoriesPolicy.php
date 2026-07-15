<?php

namespace App\Policies\Store;

use App\Policies\Store\Concerns\AuthorizesStoreMasterRecord;
use App\Support\Administration\ModulePermissionSlugs;

class MovementCategoriesPolicy
{
    use AuthorizesStoreMasterRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.movement-categories')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.movement-categories')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.movement-categories')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.movement-categories')->delete();
    }
}
