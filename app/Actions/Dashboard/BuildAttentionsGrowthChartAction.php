<?php

namespace App\Actions\Dashboard;

use App\Models\Medic\ClinicalAttention;
use App\Support\Dashboard\DashboardMonthRange;

final class BuildAttentionsGrowthChartAction
{
    /**
     * @return array{
     *     data: list<array{month: string, attentions: int}>
     * }
     */
    public function execute(string $companyId): array
    {
        [$start, $end] = DashboardMonthRange::currentWindow();
        $months = DashboardMonthRange::monthKeys($start, $end);

        $attentionsBefore = ClinicalAttention::query()
            ->forCompany($companyId)
            ->where('created_at', '<', $start)
            ->count();

        $attentionsByMonth = ClinicalAttention::query()
            ->forCompany($companyId)
            ->whereBetween('created_at', [$start, $end])
            ->get(['created_at'])
            ->countBy(static fn (ClinicalAttention $attention): string => DashboardMonthRange::monthKey($attention->created_at));

        $attentionTotal = $attentionsBefore;
        $data = [];

        foreach ($months as $month) {
            $attentionTotal += (int) ($attentionsByMonth[$month] ?? 0);

            $data[] = [
                'month' => $month,
                'attentions' => $attentionTotal,
            ];
        }

        return [
            'data' => $data,
        ];
    }
}
