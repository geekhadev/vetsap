<?php

namespace App\Actions\Agenda\AppointmentStatuses;

use App\Models\Agenda\AppointmentStatus;

final class ListActiveAppointmentStatusesForCalendarAction
{
    /**
     * @return list<array{id: string, name: string, color: string}>
     */
    public function execute(string $companyId): array
    {
        return AppointmentStatus::query()
            ->forCompanyOrGlobal($companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'color'])
            ->map(static fn (AppointmentStatus $status): array => [
                'id' => $status->id,
                'name' => $status->name,
                'color' => $status->color->value,
            ])
            ->values()
            ->all();
    }
}
