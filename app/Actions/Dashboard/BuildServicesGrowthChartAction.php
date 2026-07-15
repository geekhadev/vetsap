<?php

namespace App\Actions\Dashboard;

use App\Models\Medic\Service;
use App\Support\Dashboard\DashboardMonthRange;
use Illuminate\Support\Facades\DB;

final class BuildServicesGrowthChartAction
{
    private const TOP_SERVICES = 6;

    /**
     * @return array{
     *     series: list<array{key: string, label: string, color: string}>,
     *     data: list<array<string, int|string>>
     * }
     */
    public function execute(string $companyId): array
    {
        [$start, $end] = DashboardMonthRange::currentWindow();
        $months = DashboardMonthRange::monthKeys($start, $end);

        $applications = DB::table('medic_clinical_attention_requested_services as pivot')
            ->join('medic_clinical_attentions as attentions', 'attentions.id', '=', 'pivot.attention_id')
            ->where('attentions.company_id', $companyId)
            ->whereBetween('pivot.created_at', [$start, $end])
            ->get(['pivot.service_id', 'pivot.created_at']);

        $totalsByService = $applications
            ->countBy(static fn (object $row): string => (string) $row->service_id)
            ->sortDesc();

        $topServiceIds = $totalsByService->keys()->take(self::TOP_SERVICES)->values()->all();
        $hasOthers = $totalsByService->count() > count($topServiceIds);

        $serviceNames = Service::query()
            ->whereIn('id', $topServiceIds)
            ->pluck('name', 'id');

        $seriesKeys = $topServiceIds;
        if ($hasOthers) {
            $seriesKeys[] = 'others';
        }

        $beforeByService = DB::table('medic_clinical_attention_requested_services as pivot')
            ->join('medic_clinical_attentions as attentions', 'attentions.id', '=', 'pivot.attention_id')
            ->where('attentions.company_id', $companyId)
            ->where('pivot.created_at', '<', $start)
            ->selectRaw('pivot.service_id, count(*) as aggregate')
            ->groupBy('pivot.service_id')
            ->pluck('aggregate', 'service_id');

        $runningTotals = [];
        foreach ($topServiceIds as $serviceId) {
            $runningTotals[$serviceId] = (int) ($beforeByService[$serviceId] ?? 0);
        }

        $othersBefore = 0;
        foreach ($beforeByService as $serviceId => $count) {
            if (! in_array((string) $serviceId, $topServiceIds, true)) {
                $othersBefore += (int) $count;
            }
        }
        $runningTotals['others'] = $othersBefore;

        $byMonth = [];
        foreach ($months as $month) {
            $byMonth[$month] = array_fill_keys($seriesKeys, 0);
        }

        foreach ($applications as $row) {
            $month = DashboardMonthRange::monthKey((string) $row->created_at);
            if (! array_key_exists($month, $byMonth)) {
                continue;
            }

            $serviceId = (string) $row->service_id;
            $key = in_array($serviceId, $topServiceIds, true) ? $serviceId : 'others';

            if (! array_key_exists($key, $byMonth[$month])) {
                continue;
            }

            $byMonth[$month][$key]++;
        }

        $data = [];
        foreach ($months as $month) {
            $point = ['month' => $month];

            foreach ($seriesKeys as $key) {
                $runningTotals[$key] = ($runningTotals[$key] ?? 0) + (int) ($byMonth[$month][$key] ?? 0);
                $point[$key] = $runningTotals[$key];
            }

            $data[] = $point;
        }

        $palette = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];

        $series = [];
        foreach ($topServiceIds as $index => $serviceId) {
            $series[] = [
                'key' => $serviceId,
                'label' => (string) ($serviceNames[$serviceId] ?? 'Servicio'),
                'color' => $palette[$index % count($palette)],
            ];
        }

        if ($hasOthers) {
            $series[] = [
                'key' => 'others',
                'label' => 'Otros',
                'color' => 'chart-5',
            ];
        }

        return [
            'series' => $series,
            'data' => $data,
        ];
    }
}
