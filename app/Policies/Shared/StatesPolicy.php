<?php

namespace App\Policies\Shared;

use App\Enums\UserType;
use App\Models\Shared\State;
use App\Models\User;

class StatesPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->type === UserType::Root;
    }

    public function view(User $user, State $state): bool
    {
        return $user->type === UserType::Root;
    }

    public function create(User $user): bool
    {
        return $user->type === UserType::Root;
    }

    public function update(User $user, State $state): bool
    {
        return $user->type === UserType::Root;
    }

    public function delete(User $user, State $state): bool
    {
        return $user->type === UserType::Root;
    }

    public function restore(User $user, State $state): bool
    {
        return $user->type === UserType::Root;
    }

    public function forceDelete(User $user, State $state): bool
    {
        return $user->type === UserType::Root;
    }
}
