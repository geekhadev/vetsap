<?php

namespace App\Actions\Sale\ReceivedPayments;

use App\Models\Sale\SaleDocumentPayment;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListReceivedPaymentsForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            SaleDocumentPayment::SORTABLE_COLUMNS,
            defaultSort: 'paid_at',
            defaultDirection: 'desc',
        );

        return SaleDocumentPayment::query()
            ->forCompany($companyId)
            ->with([
                'saleDocument:id,company_id,customer_id,customer_name,customer_document_number,document_number,sii_tax_document_type_id,status,total_amount',
                'saleDocument.siiTaxDocumentType:id,name,abbreviation,code',
                'paymentMethod:id,name,code',
                'createdBy:id,name',
            ])
            ->search($filters['search'] ?? null)
            ->when(
                filled($filters['payment_method_id'] ?? null),
                fn ($query) => $query->where('payment_method_id', $filters['payment_method_id']),
            )
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
