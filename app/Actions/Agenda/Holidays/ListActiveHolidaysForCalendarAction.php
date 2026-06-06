<?php

namespace App\Actions\Agenda\Holidays;

use App\Models\Agenda\Holiday;

final class ListActiveHolidaysForCalendarAction
{
    /**
     * @return list<array{id: string, name: string, date: string}>
     */
    public function execute(string $companyId): array
    {
        return Holiday::query()
            ->forCompany($companyId)
            ->where('is_active', true)
            ->orderBy('date')
            ->get(['id', 'name', 'date'])
            ->map(static function (Holiday $holiday): array {
                return [
                    'id' => $holiday->id,
                    'name' => $holiday->name,
                    'date' => $holiday->date->format('Y-m-d'),
                ];
            })
            ->values()
            ->all();
    }
}
