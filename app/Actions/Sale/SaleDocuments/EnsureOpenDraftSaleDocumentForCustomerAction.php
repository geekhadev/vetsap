<?php

namespace App\Actions\Sale\SaleDocuments;

use App\Enums\Sale\SaleDocumentPaymentStatus;
use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Sale\Customer;
use App\Models\Sale\SaleDocument;
use Illuminate\Support\Facades\DB;

final class EnsureOpenDraftSaleDocumentForCustomerAction
{
    /**
     * Garantiza un único borrador abierto para el cliente (sin atención clínica).
     */
    public function execute(Customer $customer, ?string $userId = null): SaleDocument
    {
        return DB::transaction(function () use ($customer, $userId): SaleDocument {
            /** @var SaleDocument|null $document */
            $document = SaleDocument::query()
                ->where('company_id', $customer->company_id)
                ->where('customer_id', $customer->id)
                ->where('status', SaleDocumentStatus::Draft)
                ->orderBy('created_at')
                ->lockForUpdate()
                ->first();

            if ($document instanceof SaleDocument) {
                return $document;
            }

            return SaleDocument::query()->create([
                'company_id' => $customer->company_id,
                'customer_id' => $customer->id,
                'status' => SaleDocumentStatus::Draft,
                'payment_status' => SaleDocumentPaymentStatus::Pending,
                'customer_name' => $customer->name,
                'customer_document_type' => $customer->document_type?->value,
                'customer_document_number' => $customer->document_number,
                'customer_phone' => $customer->phone,
                'customer_email' => $customer->email,
                'customer_address' => $customer->address,
                'tax_percent' => (float) config('vetsap.sale.default_tax_percent', 19),
                'created_by_user_id' => $userId,
                'updated_by_user_id' => $userId,
            ]);
        });
    }
}
