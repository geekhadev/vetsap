<?php

namespace App\Policies\Sale;

use App\Enums\Sale\CashRegisterStatus;
use App\Enums\UserType;
use App\Models\Sale\CashRegister;
use App\Models\User;
use App\Policies\Concerns\AuthorizesCompanyOwnedRecord;
use App\Support\Administration\ModulePermissionSlugs;

class CashRegistersPolicy
{
    use AuthorizesCompanyOwnedRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('sale.cash-registers')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('sale.cash-registers')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('sale.cash-registers')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('sale.cash-registers')->delete();
    }

    public function close(User $user, CashRegister $cashRegister): bool
    {
        if ($cashRegister->status !== CashRegisterStatus::Open) {
            return false;
        }

        if ($cashRegister->opened_by_user_id !== $user->id && $user->type !== UserType::Root) {
            return false;
        }

        return $this->update($user, $cashRegister);
    }
}
