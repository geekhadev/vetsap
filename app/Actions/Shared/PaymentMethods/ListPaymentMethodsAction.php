<?php

namespace App\Actions\Shared\PaymentMethods;

use App\Models\Shared\PaymentMethod;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListPaymentMethodsAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(array $filters): LengthAwarePaginator
    {
        $sort = in_array($filters['sort'], PaymentMethod::SORTABLE_COLUMNS, true)
            ? $filters['sort']
            : 'created_at';
        $direction = ($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $perPage = (int) ($filters['per_page'] ?? 20);

        return PaymentMethod::query()
            ->searchNameOrCode($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
