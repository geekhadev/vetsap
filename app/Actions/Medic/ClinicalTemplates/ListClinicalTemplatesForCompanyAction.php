<?php

namespace App\Actions\Medic\ClinicalTemplates;

use App\Models\Medic\ClinicalTemplate;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListClinicalTemplatesForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            ClinicalTemplate::SORTABLE_COLUMNS,
        );

        return ClinicalTemplate::query()
            ->forCompany($companyId)
            ->with(['species:id,name', 'fields:id,template_id,field_key,label,field_order,is_required'])
            ->filterIsActive($filters['is_active'] ?? null)
            ->filterSpecies($filters['species_id'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
