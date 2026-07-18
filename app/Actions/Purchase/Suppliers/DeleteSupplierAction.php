<?php

namespace App\Actions\Purchase\Suppliers;

use App\Models\Purchase\Supplier;

final class DeleteSupplierAction
{
    public function execute(Supplier $supplier): void
    {
        $supplier->delete();
    }
}
