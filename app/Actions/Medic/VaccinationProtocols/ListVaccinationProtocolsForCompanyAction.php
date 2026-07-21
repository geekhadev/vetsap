<?php

namespace App\Actions\Medic\VaccinationProtocols;

use App\Models\Medic\VaccinationProtocol;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListVaccinationProtocolsForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            VaccinationProtocol::SORTABLE_COLUMNS,
            defaultSort: 'version',
            defaultDirection: 'desc',
        );

        return VaccinationProtocol::query()
            ->forCompany($companyId)
            ->with(['species:id,name', 'items.product:id,name'])
            ->withCount('items')
            ->filterIsActive($filters['is_active'] ?? null)
            ->filterSpecies($filters['species_id'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
