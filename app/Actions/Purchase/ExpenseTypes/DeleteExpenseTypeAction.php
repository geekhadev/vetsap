<?php

namespace App\Actions\Purchase\ExpenseTypes;

use App\Models\Purchase\ExpenseType;
use Illuminate\Validation\ValidationException;

final class DeleteExpenseTypeAction
{
    public function execute(ExpenseType $expenseType): void
    {
        if ($expenseType->isGlobal()) {
            throw ValidationException::withMessages([
                'name' => 'No se puede eliminar un tipo de gasto global del sistema.',
            ]);
        }

        $expenseType->delete();
    }
}
