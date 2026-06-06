<?php

namespace App\Actions\Medic\Specialties;

use App\Models\Medic\Specialty;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListSpecialtiesForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            Specialty::SORTABLE_COLUMNS,
        );

        return Specialty::query()
            ->forCompany($companyId)
            ->withCount(['services as active_services_count' => function ($query): void {
                $query->where('is_active', true);
            }])
            ->filterIsActive($filters['is_active'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
