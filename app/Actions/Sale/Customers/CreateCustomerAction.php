<?php

namespace App\Actions\Sale\Customers;

use App\Enums\Sale\CustomerDocumentType;
use App\Models\Sale\Customer;

final class CreateCustomerAction
{
    /**
     * @param  array{company_id: string, name: string, document_type: CustomerDocumentType, document_number: string, email: string|null, phone: string|null, address: string|null}  $data
     */
    public function execute(array $data): Customer
    {
        return Customer::query()->create($data);
    }
}
