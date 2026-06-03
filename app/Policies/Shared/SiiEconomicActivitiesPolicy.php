<?php

namespace App\Policies\Shared;

use App\Models\Shared\SiiEconomicActivity;
use App\Models\User;

class SiiEconomicActivitiesPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, SiiEconomicActivity $siiEconomicActivity): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, SiiEconomicActivity $siiEconomicActivity): bool
    {
        return true;
    }

    public function delete(User $user, SiiEconomicActivity $siiEconomicActivity): bool
    {
        return true;
    }

    public function restore(User $user, SiiEconomicActivity $siiEconomicActivity): bool
    {
        return true;
    }

    public function forceDelete(User $user, SiiEconomicActivity $siiEconomicActivity): bool
    {
        return true;
    }
}
