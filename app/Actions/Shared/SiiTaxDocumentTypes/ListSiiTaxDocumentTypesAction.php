<?php

namespace App\Actions\Shared\SiiTaxDocumentTypes;

use App\Models\Shared\SiiTaxDocumentType;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListSiiTaxDocumentTypesAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            SiiTaxDocumentType::SORTABLE_COLUMNS,
            'created_at',
            'desc',
        );

        $query = SiiTaxDocumentType::query()
            ->searchFields($filters['search'] ?? null);

        match ($filters['usage_filter'] ?? null) {
            'sale' => $query->filterUseSale(true),
            'purchase' => $query->filterUsePurchase(true),
            default => null,
        };

        return $query
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
