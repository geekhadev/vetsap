<?php

namespace App\Actions\Medic\Services;

use App\Models\Medic\Service;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListServicesForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        $sort = in_array($filters['sort'], Service::SORTABLE_COLUMNS, true)
            ? $filters['sort']
            : 'name';
        $direction = ($filters['direction'] ?? 'asc') === 'asc' ? 'asc' : 'desc';
        $perPage = (int) ($filters['per_page'] ?? 20);

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
