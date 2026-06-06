<?php

namespace App\Actions\Shared\PaymentTypes;

use App\Models\Shared\PaymentType;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListPaymentTypesAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            PaymentType::SORTABLE_COLUMNS,
            'created_at',
            'desc',
        );

        return PaymentType::query()
            ->searchNameOrCode($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
