<?php

namespace App\Actions\Medic\Patients;

use App\Models\Medic\Patient;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListPatientsForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            Patient::SORTABLE_COLUMNS,
        );

        return Patient::query()
            ->forCompany($companyId)
            ->with([
                'species:id,name',
                'customer:id,name,document_type,document_number',
            ])
            ->filterIsActive($filters['is_active'] ?? null)
            ->filterSpecies($filters['species_id'] ?? null)
            ->filterCustomer($filters['customer_id'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
