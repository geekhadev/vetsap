<?php

namespace App\Actions\Purchase\Expenses;

use App\Models\Purchase\Expense;

final class UpdateExpenseAction
{
    /**
     * @param  array{spent_at: string, expense_type_id: string, amount: string, reason: string}  $data
     */
    public function execute(Expense $expense, array $data): Expense
    {
        $expense->update($data);

        return $expense;
    }
}
