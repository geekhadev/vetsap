<?php

namespace App\Actions\Purchase\Suppliers;

use App\Enums\Purchase\SupplierDocumentType;
use App\Models\Purchase\Supplier;

final class CreateSupplierAction
{
    /**
     * @param  array{company_id: string, name: string, document_type: SupplierDocumentType, document_number: string, email: string|null, phone: string|null, address: string|null}  $data
     */
    public function execute(array $data): Supplier
    {
        return Supplier::query()->create($data);
    }
}
