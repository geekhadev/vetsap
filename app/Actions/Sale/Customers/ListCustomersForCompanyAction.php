<?php

namespace App\Actions\Sale\Customers;

use App\Models\Sale\Customer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListCustomersForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        $sort = in_array($filters['sort'], Customer::SORTABLE_COLUMNS, true)
            ? $filters['sort']
            : 'name';
        $direction = ($filters['direction'] ?? 'asc') === 'asc' ? 'asc' : 'desc';
        $perPage = (int) ($filters['per_page'] ?? 20);

        return Customer::query()
            ->forCompany($companyId)
            ->filterDocumentType($filters['document_type'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
