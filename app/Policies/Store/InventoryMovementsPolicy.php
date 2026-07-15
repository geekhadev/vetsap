<?php

namespace App\Policies\Store;

use App\Policies\Concerns\AuthorizesCompanyOwnedRecord;
use App\Support\Administration\ModulePermissionSlugs;

class InventoryMovementsPolicy
{
    use AuthorizesCompanyOwnedRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.inventory-movements')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.inventory-movements')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.inventory-movements')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('store.inventory-movements')->delete();
    }
}
