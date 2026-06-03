<?php

namespace App\Policies\Shared;

use App\Models\Shared\PaymentType;
use App\Models\User;

class PaymentTypesPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, PaymentType $paymentType): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, PaymentType $paymentType): bool
    {
        return true;
    }

    public function delete(User $user, PaymentType $paymentType): bool
    {
        return true;
    }

    public function restore(User $user, PaymentType $paymentType): bool
    {
        return true;
    }

    public function forceDelete(User $user, PaymentType $paymentType): bool
    {
        return true;
    }
}
