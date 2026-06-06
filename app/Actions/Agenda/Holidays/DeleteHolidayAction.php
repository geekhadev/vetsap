<?php

namespace App\Actions\Agenda\Holidays;

use App\Models\Agenda\Holiday;

final class DeleteHolidayAction
{
    public function execute(Holiday $holiday): void
    {
        $holiday->delete();
    }
}
