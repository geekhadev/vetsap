<?php

namespace App\Actions\Sale\Customers;

use App\Enums\UserType;
use App\Models\Sale\Customer;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class DetachCustomerPortalUserAction
{
    /**
     * Desvincula el usuario portal del cliente. Si el usuario es de tipo customer
     * y no queda ligado a ningún otro cliente, se elimina.
     */
    public function execute(Customer $customer): void
    {
        DB::transaction(function () use ($customer): void {
            $customer->loadMissing('user');

            $user = $customer->user;

            $customer->update(['user_id' => null]);

            if (! $user instanceof User || $user->type !== UserType::Customer) {
                return;
            }

            $stillLinked = Customer::query()
                ->where('user_id', $user->id)
                ->exists();

            if (! $stillLinked) {
                $user->delete();
            }
        });
    }
}
