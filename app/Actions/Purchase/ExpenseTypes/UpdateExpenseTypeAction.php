<?php

namespace App\Actions\Purchase\ExpenseTypes;

use App\Models\Purchase\ExpenseType;
use Illuminate\Validation\ValidationException;

final class UpdateExpenseTypeAction
{
    /**
     * @param  array{name: string, abbreviation: string}  $data
     */
    public function execute(ExpenseType $expenseType, array $data): ExpenseType
    {
        if ($expenseType->isGlobal()) {
            throw ValidationException::withMessages([
                'name' => 'No se puede editar un tipo de gasto global del sistema.',
            ]);
        }

        $expenseType->update($data);

        return $expenseType;
    }
}
