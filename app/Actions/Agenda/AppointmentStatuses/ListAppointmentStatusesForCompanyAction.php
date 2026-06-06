<?php

namespace App\Actions\Agenda\AppointmentStatuses;

use App\Models\Agenda\AppointmentStatus;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListAppointmentStatusesForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            AppointmentStatus::SORTABLE_COLUMNS,
        );

        return AppointmentStatus::query()
            ->forCompanyOrGlobal($companyId)
            ->filterIsActive($filters['is_active'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
