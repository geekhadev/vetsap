<?php

namespace App\Support;

use App\Enums\UserType;
use App\Models\User;

final class AuthenticatedHome
{
    public static function routeName(User $user): string
    {
        return $user->type === UserType::Customer
            ? 'customer.pets.index'
            : 'dashboard';
    }
}
