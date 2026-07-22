<?php

namespace App\Actions\Customer\Documents;

use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Sale\Customer;
use App\Models\Sale\SaleDocument;
use App\Models\User;
use Illuminate\Support\Collection;

final class ListSaleDocumentsForCustomerUserAction
{
    /**
     * Documentos de venta emitidos/anulados del cliente vinculado al usuario portal.
     *
     * @return Collection<int, array{
     *     id: string,
     *     status: string,
     *     payment_status: string,
     *     document_number: string|null,
     *     issued_at: string|null,
     *     total_amount: int,
     *     paid_amount: int,
     *     sii_tax_document_type: array{id: string, code: string, name: string, abbreviation: string}|null,
     *     created_at: string|null
     * }>
     */
    public function execute(User $user, ?string $companyId = null): Collection
    {
        $customerIds = Customer::query()
            ->where('user_id', $user->id)
            ->when(
                is_string($companyId) && $companyId !== '',
                fn ($query) => $query->where('company_id', $companyId),
            )
            ->pluck('id');

        if ($customerIds->isEmpty()) {
            return collect();
        }

        return SaleDocument::query()
            ->whereIn('customer_id', $customerIds)
            ->whereIn('status', [
                SaleDocumentStatus::Issued,
                SaleDocumentStatus::Voided,
            ])
            ->with(['siiTaxDocumentType:id,code,name,abbreviation'])
            ->orderByDesc('issued_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(static fn (SaleDocument $document): array => [
                'id' => $document->id,
                'status' => $document->status->value,
                'payment_status' => $document->payment_status->value,
                'document_number' => $document->document_number,
                'issued_at' => $document->issued_at?->toIso8601String(),
                'total_amount' => (int) $document->total_amount,
                'paid_amount' => (int) $document->paid_amount,
                'sii_tax_document_type' => $document->siiTaxDocumentType === null
                    ? null
                    : [
                        'id' => $document->siiTaxDocumentType->id,
                        'code' => $document->siiTaxDocumentType->code,
                        'name' => $document->siiTaxDocumentType->name,
                        'abbreviation' => $document->siiTaxDocumentType->abbreviation,
                    ],
                'created_at' => $document->created_at?->toIso8601String(),
            ])
            ->values();
    }
}
