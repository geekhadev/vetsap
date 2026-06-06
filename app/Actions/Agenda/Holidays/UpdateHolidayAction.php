<?php

namespace App\Actions\Agenda\Holidays;

use App\Models\Agenda\Holiday;

final class UpdateHolidayAction
{
    /**
     * @param  array{name: string, date: string, is_active: bool}  $data
     */
    public function execute(Holiday $holiday, array $data): Holiday
    {
        $holiday->update($data);

        return $holiday;
    }
}
