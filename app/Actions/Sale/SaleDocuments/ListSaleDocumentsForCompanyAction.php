<?php

namespace App\Actions\Sale\SaleDocuments;

use App\Enums\Sale\SaleDocumentStatus;
use App\Models\Sale\SaleDocument;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListSaleDocumentsForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            SaleDocument::SORTABLE_COLUMNS,
            defaultSort: 'created_at',
            defaultDirection: 'desc',
        );

        return SaleDocument::query()
            ->forCompany($companyId)
            ->where('status', '!=', SaleDocumentStatus::Merged)
            ->with([
                'customer:id,name',
                'office:id,name',
                'siiTaxDocumentType:id,code,name,abbreviation',
            ])
            ->search($filters['search'] ?? null)
            ->when(
                filled($filters['status'] ?? null),
                fn ($query) => $query->where('status', $filters['status']),
            )
            ->when(
                filled($filters['payment_status'] ?? null),
                fn ($query) => $query->where('payment_status', $filters['payment_status']),
            )
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
