<?php

namespace App\Actions\Sale\CashRegisters;

use App\Models\Sale\CashRegister;

final class ResolveOpenCashRegisterForUserAction
{
    public function execute(string $companyId, string $userId): ?CashRegister
    {
        return CashRegister::query()
            ->forCompany($companyId)
            ->forUser($userId)
            ->open()
            ->with(['office:id,name'])
            ->orderByDesc('opened_at')
            ->first();
    }
}
