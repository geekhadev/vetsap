<?php

namespace App\Policies\Sale;

use App\Models\Sale\CertificationSiiTicket;
use App\Models\User;

class CertificationSiiTicketsPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CertificationSiiTicket $certificationSiiTicket): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, CertificationSiiTicket $certificationSiiTicket): bool
    {
        return true;
    }

    public function delete(User $user, CertificationSiiTicket $certificationSiiTicket): bool
    {
        return true;
    }

    public function restore(User $user, CertificationSiiTicket $certificationSiiTicket): bool
    {
        return true;
    }

    public function forceDelete(User $user, CertificationSiiTicket $certificationSiiTicket): bool
    {
        return true;
    }
}
