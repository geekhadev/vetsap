<?php

namespace App\Actions\Medic\ClinicalAttentions;

use App\Models\Medic\ClinicalAttention;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListClinicalAttentionsForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            ClinicalAttention::SORTABLE_COLUMNS,
        );

        return ClinicalAttention::query()
            ->forCompany($companyId)
            ->closed()
            ->with([
                'patient:id,name,record_number',
                'doctor:id,first_name,last_name',
                'template:id,name',
            ])
            ->filterPatient($filters['patient_id'] ?? null)
            ->filterDoctor($filters['doctor_id'] ?? null)
            ->filterTemplate($filters['template_id'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
