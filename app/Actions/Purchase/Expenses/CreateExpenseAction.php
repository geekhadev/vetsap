<?php

namespace App\Actions\Purchase\Expenses;

use App\Models\Purchase\Expense;

final class CreateExpenseAction
{
    /**
     * @param  array{company_id: string, spent_at: string, expense_type_id: string, amount: string, reason: string}  $data
     */
    public function execute(array $data): Expense
    {
        return Expense::query()->create($data);
    }
}
