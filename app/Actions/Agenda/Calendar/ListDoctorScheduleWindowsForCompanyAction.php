<?php

namespace App\Actions\Agenda\Calendar;

use App\Enums\Medic\DoctorScheduleDayOfWeek;
use App\Models\Medic\DoctorScheduleBlock;

final class ListDoctorScheduleWindowsForCompanyAction
{
    /**
     * Ventanas horarias (HH:MM) por día ISO de todos los doctores activos de la empresa.
     *
     * @return list<array{day_of_week: int, starts_at: string, ends_at: string}>
     */
    public function execute(string $companyId): array
    {
        return DoctorScheduleBlock::query()
            ->whereHas(
                'doctor',
                fn ($query) => $query
                    ->forCompany($companyId)
                    ->where('is_active', true),
            )
            ->orderBy('day_of_week')
            ->orderBy('starts_at')
            ->get(['day_of_week', 'starts_at', 'ends_at'])
            ->map(static function (DoctorScheduleBlock $block): array {
                $dayOfWeek = $block->day_of_week;

                return [
                    'day_of_week' => $dayOfWeek instanceof DoctorScheduleDayOfWeek
                        ? $dayOfWeek->value
                        : (int) $dayOfWeek,
                    'starts_at' => substr((string) $block->starts_at, 0, 5),
                    'ends_at' => substr((string) $block->ends_at, 0, 5),
                ];
            })
            ->values()
            ->all();
    }
}
