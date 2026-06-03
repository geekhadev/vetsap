<?php

namespace App\Actions\Sale\Customers;

use App\Models\Sale\Customer;

final class DeleteCustomerAction
{
    public function execute(Customer $customer): void
    {
        $customer->delete();
    }
}
