<?php

namespace App\Actions\Medic\Specialties;

use App\Models\Medic\Specialty;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListSpecialtiesForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        $sort = in_array($filters['sort'], Specialty::SORTABLE_COLUMNS, true)
            ? $filters['sort']
            : 'name';
        $direction = ($filters['direction'] ?? 'asc') === 'asc' ? 'asc' : 'desc';
        $perPage = (int) ($filters['per_page'] ?? 20);

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
