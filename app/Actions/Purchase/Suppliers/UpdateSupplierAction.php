<?php

namespace App\Actions\Purchase\Suppliers;

use App\Models\Purchase\Supplier;

final class UpdateSupplierAction
{
    /**
     * @param  array{name: string, email: string|null, phone: string|null, address: string|null}  $data
     */
    public function execute(Supplier $supplier, array $data): Supplier
    {
        $supplier->update($data);

        return $supplier;
    }
}
