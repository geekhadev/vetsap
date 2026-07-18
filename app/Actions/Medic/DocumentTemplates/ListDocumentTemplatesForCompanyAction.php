<?php

namespace App\Actions\Medic\DocumentTemplates;

use App\Models\Medic\DocumentTemplate;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListDocumentTemplatesForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            DocumentTemplate::SORTABLE_COLUMNS,
        );

        return DocumentTemplate::query()
            ->forCompany($companyId)
            ->search($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
