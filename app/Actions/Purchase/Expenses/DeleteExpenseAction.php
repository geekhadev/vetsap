<?php

namespace App\Actions\Purchase\Expenses;

use App\Models\Purchase\Expense;

final class DeleteExpenseAction
{
    public function execute(Expense $expense): void
    {
        $expense->delete();
    }
}
