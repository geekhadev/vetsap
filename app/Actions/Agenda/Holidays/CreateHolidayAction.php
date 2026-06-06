<?php

namespace App\Actions\Agenda\Holidays;

use App\Models\Agenda\Holiday;

final class CreateHolidayAction
{
    /**
     * @param  array{company_id: string, name: string, date: string, is_active: bool}  $data
     */
    public function execute(array $data): Holiday
    {
        return Holiday::query()->create($data);
    }
}
