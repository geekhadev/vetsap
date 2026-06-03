<?php

namespace App\Actions\Sale\Customers;

use App\Models\Sale\Customer;

final class UpdateCustomerAction
{
    /**
     * @param  array{name: string, email: string|null, phone: string|null, address: string|null}  $data
     */
    public function execute(Customer $customer, array $data): Customer
    {
        $customer->update($data);

        return $customer;
    }
}
