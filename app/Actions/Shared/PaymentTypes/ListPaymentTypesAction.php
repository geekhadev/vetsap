<?php

namespace App\Actions\Shared\PaymentTypes;

use App\Models\Shared\PaymentType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListPaymentTypesAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(array $filters): LengthAwarePaginator
    {
        $sort = in_array($filters['sort'], PaymentType::SORTABLE_COLUMNS, true)
            ? $filters['sort']
            : 'created_at';
        $direction = ($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $perPage = (int) ($filters['per_page'] ?? 20);

        return PaymentType::query()
            ->searchNameOrCode($filters['search'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
