<?php

namespace App\Actions\Medic\Species;

use App\Models\Medic\Species;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListSpeciesForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        $sort = in_array($filters['sort'], Species::SORTABLE_COLUMNS, true)
            ? $filters['sort']
            : 'sort_order';
        $direction = ($filters['direction'] ?? 'asc') === 'asc' ? 'asc' : 'desc';
        $perPage = (int) ($filters['per_page'] ?? 20);

        return Species::query()
            ->forCompany($companyId)
            ->filterIsActive($filters['is_active'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->when($sort === 'sort_order', function ($query) use ($direction): void {
                $query->orderBy('name', $direction === 'asc' ? 'asc' : 'desc');
            })
            ->paginate($perPage)
            ->withQueryString();
    }
}
