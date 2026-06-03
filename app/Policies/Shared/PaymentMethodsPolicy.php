<?php

namespace App\Policies\Shared;

use App\Models\Shared\PaymentMethod;
use App\Models\User;

class PaymentMethodsPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, PaymentMethod $paymentMethod): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, PaymentMethod $paymentMethod): bool
    {
        return true;
    }

    public function delete(User $user, PaymentMethod $paymentMethod): bool
    {
        return true;
    }

    public function restore(User $user, PaymentMethod $paymentMethod): bool
    {
        return true;
    }

    public function forceDelete(User $user, PaymentMethod $paymentMethod): bool
    {
        return true;
    }
}
