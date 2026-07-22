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
            ->with([
                'user:id,name,email',
                'patients' => fn ($query) => $query
                    ->select(
                        'id',
                        'customer_id',
                        'species_id',
                        'record_number',
                        'name',
                        'breed',
                        'sex',
                        'birth_date',
                        'weight_kg',
                        'is_sterilized',
                        'colors',
                        'blood_type',
                        'microchip_number',
                        'is_active',
                        'created_at',
                        'updated_at',
                    )
                    ->with(['species:id,name'])
                    ->orderBy('name'),
            ])
            ->withCount('patients')
            ->filterDocumentType($filters['document_type'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
