<?php

namespace App\Policies\Shared;

use App\Enums\UserType;
use App\Models\Shared\Country;
use App\Models\User;

class CountriesPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->type === UserType::Root;
    }

    public function view(User $user, Country $country): bool
    {
        return $user->type === UserType::Root;
    }

    public function create(User $user): bool
    {
        return $user->type === UserType::Root;
    }

    public function update(User $user, Country $country): bool
    {
        return $user->type === UserType::Root;
    }

    public function delete(User $user, Country $country): bool
    {
        return $user->type === UserType::Root;
    }

    public function restore(User $user, Country $country): bool
    {
        return $user->type === UserType::Root;
    }

    public function forceDelete(User $user, Country $country): bool
    {
        return $user->type === UserType::Root;
    }
}
