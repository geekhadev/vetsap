<?php

namespace App\Actions\Purchase\Expenses;

use App\Models\Purchase\Expense;
use App\Support\Pagination\ListFilterPagination;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListExpensesForCompanyAction
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function execute(string $companyId, array $filters): LengthAwarePaginator
    {
        ['sort' => $sort, 'direction' => $direction, 'per_page' => $perPage] = ListFilterPagination::resolveFromFilters(
            $filters,
            Expense::SORTABLE_COLUMNS,
            defaultSort: 'spent_at',
            defaultDirection: 'desc',
        );

        return Expense::query()
            ->forCompany($companyId)
            ->with([
                'expenseType:id,name,abbreviation',
            ])
            ->search($filters['search'] ?? null)
            ->filterExpenseTypeId($filters['expense_type_id'] ?? null)
            ->orderByColumn($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();
    }
}
