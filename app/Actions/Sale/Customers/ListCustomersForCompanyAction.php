<?php

namespace App\Actions\Sale\Customers;

use App\Models\Sale\Customer;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListCustomersForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            Customer::SORTABLE_COLUMNS,
        );

        return Customer::query()
            ->forCompany($companyId)
            ->filterDocumentType($filters['document_type'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
