<?php

namespace App\Actions\Agenda\Calendar;

use App\Enums\Medic\DoctorScheduleDayOfWeek;
use App\Models\Medic\DoctorScheduleBlock;

final class ListScheduledDaysOfWeekForCompanyAction
{
    /**
     * Días ISO (1=lunes … 7=domingo) con al menos un bloque horario de un doctor activo.
     *
     * @return list<int>
     */
    public function execute(string $companyId, bool $webOnly = false): array
    {
        return DoctorScheduleBlock::query()
            ->whereHas(
                'doctor',
                fn ($query) => $query
                    ->forCompany($companyId)
                    ->where('is_active', true)
                    ->when($webOnly, fn ($inner) => $inner->where('use_web', true)),
            )
            ->distinct()
            ->orderBy('day_of_week')
            ->pluck('day_of_week')
            ->map(static function (DoctorScheduleDayOfWeek|int|string $dayOfWeek): int {
                if ($dayOfWeek instanceof DoctorScheduleDayOfWeek) {
                    return $dayOfWeek->value;
                }

                return (int) $dayOfWeek;
            })
            ->values()
            ->all();
    }
}
