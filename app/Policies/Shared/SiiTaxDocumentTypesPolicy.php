<?php

namespace App\Policies\Shared;

use App\Models\Shared\SiiTaxDocumentType;
use App\Models\User;

class SiiTaxDocumentTypesPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, SiiTaxDocumentType $siiTaxDocumentType): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, SiiTaxDocumentType $siiTaxDocumentType): bool
    {
        return true;
    }

    public function delete(User $user, SiiTaxDocumentType $siiTaxDocumentType): bool
    {
        return true;
    }

    public function restore(User $user, SiiTaxDocumentType $siiTaxDocumentType): bool
    {
        return true;
    }

    public function forceDelete(User $user, SiiTaxDocumentType $siiTaxDocumentType): bool
    {
        return true;
    }
}
