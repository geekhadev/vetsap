<?php

namespace App\Policies\Sale;

use App\Models\Sale\SaleDocumentPayment;
use App\Models\User;
use App\Policies\Concerns\AuthorizesCompanyOwnedRecord;
use App\Support\Administration\ModulePermissionSlugs;
use Illuminate\Database\Eloquent\Model;

class ReceivedPaymentsPolicy
{
    use AuthorizesCompanyOwnedRecord;

    protected function listPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('sale.received-payments')->list();
    }

    protected function createPermissionSlug(): string
    {
        return ModulePermissionSlugs::for('sale.received-payments')->create();
    }

    protected function updatePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('sale.received-payments')->update();
    }

    protected function deletePermissionSlug(): string
    {
        return ModulePermissionSlugs::for('sale.received-payments')->delete();
    }

    public function view(User $user, Model $record): bool
    {
        if (! $record instanceof SaleDocumentPayment) {
            return false;
        }

        $record->loadMissing('saleDocument');

        return $this->canList($user)
            && $this->sessionCompanyMatches((string) $record->saleDocument?->company_id);
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function updateAny(User $user): bool
    {
        return false;
    }

    public function deleteAny(User $user): bool
    {
        return false;
    }

    public function update(User $user, Model $record): bool
    {
        return false;
    }

    public function delete(User $user, Model $record): bool
    {
        return false;
    }
}
