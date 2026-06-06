<?php

namespace App\Actions\Web\Clinic;

use App\Actions\Agenda\Calendar\ListScheduledDaysOfWeekForCompanyAction;
use App\Models\Agenda\Appointment;
use App\Models\Agenda\Holiday;
use App\Models\Medic\Doctor;
use App\Models\Medic\Service;
use App\Models\Medic\Species;
use App\Support\Agenda\AgendaSlotDuration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

final class BuildPublicBookingScheduleAction
{
    public function __construct(
        private ListScheduledDaysOfWeekForCompanyAction $listScheduledDaysOfWeek,
    ) {}

    /**
     * @return array{
     *     services: list<array{
     *         id: string,
     *         name: string,
     *         description: string,
     *         block_count: int,
     *         duration_minutes: int,
     *     }>,
     *     doctors: list<array{
     *         id: string,
     *         name: string,
     *         specialty: string,
     *         service_ids: list<string>,
     *         service_durations: array<string, int>,
     *     }>,
     *     block_config: array{block_minutes: int, days_ahead: int},
     *     veterinarian_blocks: list<array{
     *         date: string,
     *         veterinarian_id: string,
     *         block_index: int,
     *         start_time: string,
     *         available: bool,
     *     }>,
     *     holidays: list<array{id: string, name: string, date: string}>,
     *     scheduled_days_of_week: list<int>,
     *     species: list<array{id: string, name: string}>,
     * }
     */
    public function execute(string $companyId): array
    {
        $blockMinutes = AgendaSlotDuration::BLOCK_MINUTES;
        $daysAhead = AgendaSlotDuration::BOOKING_DAYS_AHEAD;

        $holidayDates = $this->resolveHolidayDates($companyId);
        $doctors = $this->resolveDoctors($companyId);
        $appointmentsByDoctor = $this->resolveBlockingAppointmentsByDoctor($companyId, $daysAhead);
        $services = $this->resolveServices($doctors, $companyId, $blockMinutes);
        $veterinarianBlocks = $this->buildVeterinarianBlocks(
            $doctors,
            $holidayDates,
            $appointmentsByDoctor,
            $blockMinutes,
            $daysAhead,
        );

        return [
            'services' => $services,
            'doctors' => $this->mapDoctors($doctors),
            'block_config' => [
                'block_minutes' => $blockMinutes,
                'days_ahead' => $daysAhead,
            ],
            'veterinarian_blocks' => $veterinarianBlocks,
            'holidays' => $this->resolveHolidays($companyId),
            'scheduled_days_of_week' => $this->listScheduledDaysOfWeek->execute($companyId, webOnly: true),
            'species' => $this->resolveSpecies($companyId),
        ];
    }

    /**
     * @return list<array{id: string, name: string}>
     */
    private function resolveSpecies(string $companyId): array
    {
        return Species::query()
            ->forCompany($companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(static fn (Species $species): array => [
                'id' => $species->id,
                'name' => $species->name,
            ])
            ->values()
            ->all();
    }

    /**
     * @return list<array{id: string, name: string, date: string}>
     */
    private function resolveHolidays(string $companyId): array
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

    /**
     * @return list<string>
     */
    private function resolveHolidayDates(string $companyId): array
    {
        return array_column($this->resolveHolidays($companyId), 'date');
    }

    /**
     * @return Collection<int, Doctor>
     */
    private function resolveDoctors(string $companyId): Collection
    {
        return Doctor::query()
            ->forCompany($companyId)
            ->where('is_active', true)
            ->where('use_web', true)
            ->with([
                'services' => fn ($query) => $query
                    ->where('medic_services.is_active', true)
                    ->where('medic_services.use_web', true)
                    ->with('specialty:id,name')
                    ->select(
                        'medic_services.id',
                        'medic_services.name',
                        'medic_services.duration_minutes',
                        'medic_services.specialty_id',
                    ),
                'scheduleBlocks' => fn ($query) => $query
                    ->select('id', 'doctor_id', 'day_of_week', 'starts_at', 'ends_at', 'sort_order')
                    ->orderBy('day_of_week')
                    ->orderBy('sort_order')
                    ->orderBy('starts_at'),
            ])
            ->whereHas('scheduleBlocks')
            ->whereHas(
                'services',
                fn ($query) => $query
                    ->where('medic_services.is_active', true)
                    ->where('medic_services.use_web', true),
            )
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name']);
    }

    /**
     * @return array<string, list<array{starts_at: Carbon, ends_at: Carbon}>>
     */
    private function resolveBlockingAppointmentsByDoctor(string $companyId, int $daysAhead): array
    {
        $rangeStart = now()->startOfDay();
        $rangeEnd = now()->addDays($daysAhead)->endOfDay();

        $grouped = [];

        Appointment::query()
            ->forCompany($companyId)
            ->blockingSchedule()
            ->inPeriod($rangeStart, $rangeEnd)
            ->get(['doctor_id', 'starts_at', 'ends_at'])
            ->each(function (Appointment $appointment) use (&$grouped): void {
                $grouped[(string) $appointment->doctor_id][] = [
                    'starts_at' => Carbon::parse($appointment->starts_at),
                    'ends_at' => Carbon::parse($appointment->ends_at),
                ];
            });

        return $grouped;
    }

    /**
     * @param  Collection<int, Doctor>  $doctors
     * @return list<array{
     *     id: string,
     *     name: string,
     *     description: string,
     *     block_count: int,
     *     duration_minutes: int,
     * }>
     */
    private function resolveServices(Collection $doctors, string $companyId, int $blockMinutes): array
    {
        $doctorServiceIds = $doctors
            ->flatMap(static fn (Doctor $doctor): Collection => $doctor->services->pluck('id'))
            ->unique()
            ->values();

        if ($doctorServiceIds->isEmpty()) {
            return [];
        }

        return Service::query()
            ->forCompany($companyId)
            ->where('is_active', true)
            ->where('use_web', true)
            ->whereIn('id', $doctorServiceIds)
            ->whereNotNull('duration_minutes')
            ->where('duration_minutes', '>', 0)
            ->orderBy('name')
            ->get(['id', 'name', 'description', 'duration_minutes'])
            ->map(static function (Service $service) use ($blockMinutes): array {
                $durationMinutes = (int) $service->duration_minutes;

                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'description' => (string) ($service->description ?? ''),
                    'block_count' => (int) ceil($durationMinutes / $blockMinutes),
                    'duration_minutes' => $durationMinutes,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, Doctor>  $doctors
     * @return list<array{
     *     id: string,
     *     name: string,
     *     specialty: string,
     *     service_ids: list<string>,
     *     service_durations: array<string, int>,
     * }>
     */
    private function mapDoctors(Collection $doctors): array
    {
        return $doctors
            ->map(function (Doctor $doctor): array {
                $serviceDurations = [];
                $serviceIds = [];

                foreach ($doctor->services as $service) {
                    $duration = $service->pivot->duration_override_minutes ?? $service->duration_minutes;

                    if ($duration === null || (int) $duration <= 0) {
                        continue;
                    }

                    $serviceId = (string) $service->id;
                    $serviceIds[] = $serviceId;
                    $serviceDurations[$serviceId] = (int) $duration;
                }

                $specialty = $doctor->services
                    ->first()
                    ?->specialty
                    ?->name ?? '';

                return [
                    'id' => $doctor->id,
                    'name' => trim(sprintf('%s %s', $doctor->first_name, $doctor->last_name)),
                    'specialty' => $specialty,
                    'service_ids' => $serviceIds,
                    'service_durations' => $serviceDurations,
                ];
            })
            ->filter(static fn (array $doctor): bool => $doctor['service_ids'] !== [])
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, Doctor>  $doctors
     * @param  list<string>  $holidayDates
     * @param  array<string, list<array{starts_at: Carbon, ends_at: Carbon}>>  $appointmentsByDoctor
     * @return list<array{
     *     date: string,
     *     veterinarian_id: string,
     *     block_index: int,
     *     start_time: string,
     *     available: bool,
     * }>
     */
    private function buildVeterinarianBlocks(
        Collection $doctors,
        array $holidayDates,
        array $appointmentsByDoctor,
        int $blockMinutes,
        int $daysAhead,
    ): array {
        $holidayLookup = array_fill_keys($holidayDates, true);
        $blocks = [];
        $today = now()->startOfDay();

        for ($dayOffset = 0; $dayOffset < $daysAhead; $dayOffset += 1) {
            $date = $today->copy()->addDays($dayOffset);
            $dateKey = $date->toDateString();

            if (isset($holidayLookup[$dateKey])) {
                continue;
            }

            $dayOfWeek = $date->dayOfWeekIso;

            foreach ($doctors as $doctor) {
                $dayScheduleBlocks = $doctor->scheduleBlocks
                    ->filter(static fn ($block): bool => (int) $block->day_of_week->value === $dayOfWeek);

                if ($dayScheduleBlocks->isEmpty()) {
                    continue;
                }

                $startTimes = [];

                foreach ($dayScheduleBlocks as $scheduleBlock) {
                    $current = $this->normalizeTime((string) $scheduleBlock->starts_at);
                    $endsAt = $this->normalizeTime((string) $scheduleBlock->ends_at);

                    while ($current < $endsAt) {
                        $startTimes[] = $current;
                        $current = $this->addMinutesToTime($current, $blockMinutes);
                    }
                }

                $startTimes = array_values(array_unique($startTimes));
                sort($startTimes);
                $doctorAppointments = $appointmentsByDoctor[(string) $doctor->id] ?? [];

                foreach ($startTimes as $blockIndex => $startTime) {
                    $slotStart = Carbon::parse(sprintf('%s %s:00', $dateKey, $startTime));
                    $slotEnd = $slotStart->copy()->addMinutes($blockMinutes);
                    $available = $this->isSlotAvailable($slotStart, $slotEnd, $doctorAppointments);

                    $blocks[] = [
                        'date' => $dateKey,
                        'veterinarian_id' => $doctor->id,
                        'block_index' => $blockIndex,
                        'start_time' => $startTime,
                        'available' => $available,
                    ];
                }
            }
        }

        return $blocks;
    }

    /**
     * @param  list<array{starts_at: Carbon, ends_at: Carbon}>  $appointments
     */
    private function isSlotAvailable(Carbon $slotStart, Carbon $slotEnd, array $appointments): bool
    {
        if ($slotStart->lt(now())) {
            return false;
        }

        foreach ($appointments as $appointment) {
            if ($appointment['starts_at']->lt($slotEnd) && $appointment['ends_at']->gt($slotStart)) {
                return false;
            }
        }

        return true;
    }

    private function normalizeTime(string $time): string
    {
        return substr($time, 0, 5);
    }

    private function addMinutesToTime(string $time, int $minutes): string
    {
        [$hours, $mins] = array_map(intval(...), explode(':', $time));
        $total = $hours * 60 + $mins + $minutes;
        $normalized = (($total % (24 * 60)) + (24 * 60)) % (24 * 60);

        return sprintf('%02d:%02d', intdiv($normalized, 60), $normalized % 60);
    }
}
