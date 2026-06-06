<?php

namespace App\Actions\Agenda\Appointments;

use App\Models\Agenda\Appointment;
use Illuminate\Support\Carbon;

final class ListAppointmentsForCalendarAction
{
    /**
     * @return list<array{
     *     id: string,
     *     title: string,
     *     subtitle: string,
     *     start: string,
     *     end: string,
     *     status_color: string,
     *     cancelled: bool,
     * }>
     */
    public function execute(string $companyId): array
    {
        $rangeStart = now()->subMonths(1)->startOfDay();
        $rangeEnd = now()->addMonths(3)->endOfDay();

        return Appointment::query()
            ->forCompany($companyId)
            ->inPeriod($rangeStart, $rangeEnd)
            ->with([
                'patient:id,name',
                'service:id,name',
                'doctor:id,first_name,last_name',
                'appointmentStatus:id,name,color,is_terminal',
            ])
            ->orderByStartsAt()
            ->get()
            ->map(static function (Appointment $appointment): array {
                $doctorName = trim(
                    sprintf('%s %s', $appointment->doctor->first_name, $appointment->doctor->last_name),
                );

                return [
                    'id' => $appointment->id,
                    'title' => $appointment->patient->name,
                    'subtitle' => sprintf('%s · %s', $appointment->service->name, $doctorName),
                    'start' => Carbon::parse($appointment->starts_at)->toIso8601String(),
                    'end' => Carbon::parse($appointment->ends_at)->toIso8601String(),
                    'status_color' => $appointment->appointmentStatus->color->value,
                    'cancelled' => $appointment->appointmentStatus->name === 'Cancelado',
                ];
            })
            ->values()
            ->all();
    }
}
