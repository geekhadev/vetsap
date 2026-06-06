<?php

namespace App\Actions\Shared\PaymentMethods;

use App\Models\Shared\PaymentMethod;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListPaymentMethodsAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            PaymentMethod::SORTABLE_COLUMNS,
            'created_at',
            'desc',
        );

        return PaymentMethod::query()
            ->searchNameOrCode($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
