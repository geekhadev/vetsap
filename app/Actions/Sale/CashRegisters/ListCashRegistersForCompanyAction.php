<?php

namespace App\Actions\Sale\CashRegisters;

use App\Enums\Sale\CashRegisterStatus;
use App\Models\Sale\CashRegister;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListCashRegistersForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            CashRegister::SORTABLE_COLUMNS,
            defaultSort: 'opened_at',
            defaultDirection: 'desc',
        );

        return CashRegister::query()
            ->forCompany($companyId)
            ->with([
                'office:id,name',
                'openedBy:id,name',
                'closedBy:id,name',
            ])
            ->withSum('lines as total_amount', 'system_amount')
            ->withSum('lines as closing_total_amount', 'declared_amount')
            ->withSum('lines as balance_difference', 'difference')
            ->search($filters['search'] ?? null)
            ->when(
                filled($filters['status'] ?? null),
                fn ($query) => $query->where('status', $filters['status']),
            )
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString()
            ->through(function (CashRegister $register): CashRegister {
                $isClosed = $register->status === CashRegisterStatus::Closed;

                $register->setAttribute(
                    'total_amount',
                    (int) ($register->total_amount ?? $register->opening_amount),
                );

                $closingTotal = $isClosed
                    ? (int) ($register->closing_total_amount ?? 0)
                    : null;
                $difference = $isClosed
                    ? (int) ($register->balance_difference ?? 0)
                    : null;

                $register->setAttribute('closing_total_amount', $closingTotal);
                $register->setAttribute(
                    'balance_status',
                    match (true) {
                        ! $isClosed => null,
                        $difference === 0 => 'exact',
                        $difference > 0 => 'surplus',
                        default => 'shortage',
                    },
                );
                $register->offsetUnset('balance_difference');

                return $register;
            });
    }
}
