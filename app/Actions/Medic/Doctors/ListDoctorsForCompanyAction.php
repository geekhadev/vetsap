<?php

namespace App\Actions\Medic\Doctors;

use App\Models\Medic\Doctor;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListDoctorsForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            Doctor::SORTABLE_COLUMNS,
        );

        return Doctor::query()
            ->forCompany($companyId)
            ->with([
                'services' => fn ($query) => $query
                    ->select(
                        'medic_services.id',
                        'medic_services.name',
                        'medic_services.duration_minutes',
                        'medic_services.price',
                    ),
                'scheduleBlocks' => fn ($query) => $query
                    ->select(
                        'id',
                        'doctor_id',
                        'day_of_week',
                        'starts_at',
                        'ends_at',
                        'sort_order',
                    ),
            ])
            ->withCount('services')
            ->filterIsActive($filters['is_active'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
