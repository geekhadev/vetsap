<?php

namespace App\Actions\Dashboard;

use App\Enums\Agenda\AppointmentSource;
use App\Models\Agenda\Appointment;
use App\Models\Agenda\AppointmentStatus;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

final class BuildDailyAppointmentsChartAction
{
    private const DAYS = 14;

    /**
     * @return array{
     *     by_status: array{
     *         series: list<array{key: string, label: string, color: string}>,
     *         data: list<array<string, int|string>>
     *     },
     *     by_source: array{
     *         series: list<array{key: string, label: string, color: string}>,
     *         data: list<array<string, int|string>>
     *     }
     * }
     */
    public function execute(string $companyId): array
    {
        $end = now()->endOfDay();
        $start = now()->subDays(self::DAYS - 1)->startOfDay();
        $dates = $this->dateKeys($start, $end);

        $statuses = $this->resolveStatuses($companyId);
        $statusKeys = $statuses->pluck('id')->all();
        $sourceKeys = array_column(AppointmentSource::cases(), 'value');

        $byStatusRows = $this->emptyRows($dates, $statusKeys);
        $bySourceRows = $this->emptyRows($dates, $sourceKeys);

        Appointment::query()
            ->forCompany($companyId)
            ->whereBetween('starts_at', [$start, $end])
            ->get(['starts_at', 'appointment_status_id', 'source'])
            ->each(function (Appointment $appointment) use (&$byStatusRows, &$bySourceRows): void {
                $date = Carbon::parse($appointment->starts_at)->toDateString();

                if (! array_key_exists($date, $byStatusRows)) {
                    return;
                }

                $statusId = (string) $appointment->appointment_status_id;

                if (array_key_exists($statusId, $byStatusRows[$date])) {
                    $byStatusRows[$date][$statusId]++;
                }

                $sourceKey = $appointment->source instanceof AppointmentSource
                    ? $appointment->source->value
                    : (string) $appointment->source;

                if (array_key_exists($sourceKey, $bySourceRows[$date])) {
                    $bySourceRows[$date][$sourceKey]++;
                }
            });

        return [
            'by_status' => [
                'series' => $statuses
                    ->map(static fn (AppointmentStatus $status): array => [
                        'key' => $status->id,
                        'label' => $status->name,
                        'color' => $status->color->value,
                    ])
                    ->values()
                    ->all(),
                'data' => array_values($byStatusRows),
            ],
            'by_source' => [
                'series' => array_map(
                    static fn (AppointmentSource $source): array => [
                        'key' => $source->value,
                        'label' => $source->label(),
                        'color' => match ($source) {
                            AppointmentSource::Internal => 'chart-1',
                            AppointmentSource::Web => 'chart-2',
                            AppointmentSource::Phone => 'chart-3',
                            AppointmentSource::WalkIn => 'chart-4',
                            AppointmentSource::System => 'chart-5',
                        },
                    ],
                    AppointmentSource::cases(),
                ),
                'data' => array_values($bySourceRows),
            ],
        ];
    }

    /**
     * @return Collection<int, AppointmentStatus>
     */
    private function resolveStatuses(string $companyId): Collection
    {
        return AppointmentStatus::query()
            ->forCompanyOrGlobal($companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);
    }

    /**
     * @return list<string>
     */
    private function dateKeys(CarbonInterface $start, CarbonInterface $end): array
    {
        $dates = [];

        for ($day = $start->copy(); $day->lte($end); $day = $day->addDay()) {
            $dates[] = $day->toDateString();
        }

        return $dates;
    }

    /**
     * @param  list<string>  $dates
     * @param  list<string>  $keys
     * @return array<string, array<string, int|string>>
     */
    private function emptyRows(array $dates, array $keys): array
    {
        $rows = [];

        foreach ($dates as $date) {
            $row = ['date' => $date];

            foreach ($keys as $key) {
                $row[$key] = 0;
            }

            $rows[$date] = $row;
        }

        return $rows;
    }
}
