<?php

namespace App\Actions\Purchase\ExpenseTypes;

use App\Models\Purchase\ExpenseType;

final class CreateExpenseTypeAction
{
    /**
     * @param  array{company_id: string, name: string, abbreviation: string, is_global: bool}  $data
     */
    public function execute(array $data): ExpenseType
    {
        return ExpenseType::query()->create($data);
    }
}
