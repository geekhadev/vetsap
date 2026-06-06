<?php

namespace App\Actions\Medic\Services;

use App\Models\Medic\Service;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListServicesForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            Service::SORTABLE_COLUMNS,
        );

        return Service::query()
            ->forCompany($companyId)
            ->with(['specialty:id,name'])
            ->filterSpecialtyId($filters['specialty_id'] ?? null)
            ->filterIsActive($filters['is_active'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
