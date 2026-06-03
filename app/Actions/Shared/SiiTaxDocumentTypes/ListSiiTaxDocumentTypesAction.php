<?php

namespace App\Actions\Shared\SiiTaxDocumentTypes;

use App\Models\Shared\SiiTaxDocumentType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListSiiTaxDocumentTypesAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(array $filters): LengthAwarePaginator
    {
        $sort = in_array($filters['sort'], SiiTaxDocumentType::SORTABLE_COLUMNS, true)
            ? $filters['sort']
            : 'created_at';
        $direction = ($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $perPage = (int) ($filters['per_page'] ?? 20);

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
